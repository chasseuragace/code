import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { CandidateService } from '../candidate/candidate.service';
import * as crypto from 'crypto';
import { BlockedPhone } from './blocked-phone.entity';
import { JwtService } from '@nestjs/jwt';
import { AgencyUser } from '../agency/agency-user.entity';
import * as bcrypt from 'bcryptjs';

function normalizePhoneE164(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10 && digits.startsWith('9')) {
    return `+977${digits}`;
  }
  if (phone.startsWith('+')) return phone;
  return `+${digits}`;
}

type OtpRecord = {
  otp: string;
  expiresAt: number;
  userId: string;
  candidateId: string;
};

@Injectable()
export class AuthService {
  private otps = new Map<string, OtpRecord>(); // key: phone
  private secret = process.env.AUTH_DEV_SECRET || 'dev-secret';

  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(BlockedPhone) private readonly blocked: Repository<BlockedPhone>,
    @InjectRepository(AgencyUser) private readonly agencyUsers: Repository<AgencyUser>,
    private readonly candidates: CandidateService,
    private readonly jwt: JwtService,
  ) {}

  private generateOtp(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  async registerCandidate(input: { full_name: string; phone: string }): Promise<{ dev_otp: string }>
  {
    if (!input?.full_name || !input?.phone) throw new BadRequestException('full_name and phone are required');
    const phone = normalizePhoneE164(input.phone);

    // Enforce blocklist
    const isBlocked = await this.blocked.findOne({ where: { phone } });
    if (isBlocked) throw new BadRequestException('Phone is blocked');

    let user = await this.users.findOne({ where: { phone } });
    let candidateId: string;

    if (user) {
      if (user.role !== 'candidate') {
        throw new BadRequestException('Phone already registered with a different role');
      }
      candidateId = user.candidate_id!;
      if (!candidateId) {
        // rare: user exists but no candidate row; create one
        const cand = await this.candidates.createCandidate({ full_name: input.full_name, phone });
        user.candidate_id = cand.id;
        await this.users.save(user);
        candidateId = cand.id;
      } else {
        // latest name overrides
        await this.candidates.updateCandidate(candidateId, { full_name: input.full_name });
      }
    } else {
      // ensure candidate exists or create
      const existingCand = await this.candidates.findByPhone(phone);
      let cand = existingCand;
      if (cand) {
        // latest name overrides
        await this.candidates.updateCandidate(cand.id, { full_name: input.full_name });
      } else {
        cand = await this.candidates.createCandidate({ full_name: input.full_name, phone });
      }
      user = this.users.create({ phone, role: 'candidate', candidate_id: cand.id });
      await this.users.save(user);
      candidateId = cand.id;
    }

    const otp = this.generateOtp();
    this.otps.set(phone, { otp, expiresAt: Date.now() + 5 * 60_000, userId: user.id, candidateId });

    // NOTE: In dev we return the OTP. In prod we'd send via SMS and not return it.
    return { dev_otp: otp };
  }

  async verifyOtp(input: { phone: string; otp: string }): Promise<{ token: string; user_id: string; candidate_id: string; candidate: any }>
  {
    if (!input?.phone || !input?.otp) throw new BadRequestException('phone and otp are required');
    const phone = normalizePhoneE164(input.phone);
    const rec = this.otps.get(phone);
    if (!rec) throw new BadRequestException('No OTP requested for this phone');
    if (Date.now() > rec.expiresAt) {
      this.otps.delete(phone);
      throw new BadRequestException('OTP expired');
    }
    if (rec.otp !== input.otp) throw new BadRequestException('Invalid OTP');

    // Sign JWT
    const token = await this.jwt.signAsync({ sub: rec.userId, cid: rec.candidateId });

    // one-time use OTP
    this.otps.delete(phone);

    // mark user active
    const user = await this.users.findOne({ where: { id: rec.userId } });
    if (user) {
      user.is_active = true;
      await this.users.save(user);
    }

    const candidate = await this.candidates.findById(rec.candidateId);
    return { token, user_id: rec.userId, candidate_id: rec.candidateId, candidate };
  }

  async loginStart(input: { phone: string }): Promise<{ dev_otp: string }> {
    if (!input?.phone) throw new BadRequestException('phone is required');
    const phone = normalizePhoneE164(input.phone);
    const isBlocked = await this.blocked.findOne({ where: { phone } });
    if (isBlocked) throw new BadRequestException('Phone is blocked');

    const user = await this.users.findOne({ where: { phone } });
    if (!user) throw new NotFoundException('No registration found for this phone');

    // Fix data integrity: if user.candidate_id is null, find and link the candidate
    let candidateId = user.candidate_id;
    if (!candidateId) {
      const candidate = await this.candidates.findByPhone(phone);
      if (candidate) {
        user.candidate_id = candidate.id;
        await this.users.save(user);
        candidateId = candidate.id;
      } else {
        throw new NotFoundException('No candidate profile found for this phone');
      }
    }

    // Issue OTP
    const otp = this.generateOtp();
    this.otps.set(phone, { otp, expiresAt: Date.now() + 5 * 60_000, userId: user.id, candidateId });
    return { dev_otp: otp };
  }

  async loginVerify(input: { phone: string; otp: string }): Promise<{ token: string; user_id: string; candidate_id: string; candidate: any }> {
    // Reuse verifyOtp logic
    return this.verifyOtp(input);
  }

  // --- Agency Owner flows ---
  async registerOwner(input: { phone: string; full_name: string }): Promise<{ dev_otp: string }> {
    if (!input?.phone || !input?.full_name) throw new BadRequestException('phone and full_name are required');
    const phone = normalizePhoneE164(input.phone);
    const isBlocked = await this.blocked.findOne({ where: { phone } });
    if (isBlocked) throw new BadRequestException('Phone is blocked');

    let user = await this.users.findOne({ where: { phone } });
    if (user) {
      // upgrade to owner if not already; but reject if linked to candidate only? We'll allow multi-purpose users later; for now ensure role owner
      user.role = 'owner';
      user.is_agency_owner = true;
      user.full_name = input.full_name; // Store full_name in User
      await this.users.save(user);
    } else {
      user = this.users.create({ phone, full_name: input.full_name, role: 'owner', is_active: false, is_agency_owner: true });
      await this.users.save(user);
    }

    // Upsert AgencyUser with latest name
    let au = await this.agencyUsers.findOne({ where: [{ user_id: user.id }, { phone }] });
    if (au) {
      au.full_name = input.full_name;
      au.role = 'owner';
      au.phone = phone; // ensure normalized
      au.user_id = user.id;
      await this.agencyUsers.save(au);
    } else {
      au = this.agencyUsers.create({ full_name: input.full_name, phone, user_id: user.id, role: 'owner' });
      await this.agencyUsers.save(au);
    }

    const otp = this.generateOtp();
    this.otps.set(phone, { otp, expiresAt: Date.now() + 5 * 60_000, userId: user.id, candidateId: '' as any });
    return { dev_otp: otp };
  }

  async verifyOwner(input: { phone: string; otp: string }): Promise<{ token: string; user_id: string; agency_id?: string | null; user_type: string; phone: string; full_name?: string | null; role: string }> {
    if (!input?.phone || !input?.otp) throw new BadRequestException('phone and otp are required');
    const phone = normalizePhoneE164(input.phone);
    const rec = this.otps.get(phone);
    if (!rec) throw new BadRequestException('No OTP requested for this phone');
    if (Date.now() > rec.expiresAt) {
      this.otps.delete(phone);
      throw new BadRequestException('OTP expired');
    }
    if (rec.otp !== input.otp) throw new BadRequestException('Invalid OTP');

    const token = await this.jwt.signAsync({ sub: rec.userId });
    this.otps.delete(phone);

    const user = await this.users.findOne({ where: { id: rec.userId } });
    if (user) {
      user.is_active = true;
      user.role = 'owner';
      user.is_agency_owner = true;
      await this.users.save(user);
    }
    
    // Get full_name from User, or fallback to AgencyUser if not set
    let fullName = user?.full_name;
    if (!fullName) {
      const agencyUser = await this.agencyUsers.findOne({ where: { user_id: rec.userId } });
      fullName = agencyUser?.full_name || null;
    }
    
    return { token, user_id: rec.userId, agency_id: user?.agency_id || null, user_type: 'owner', phone, full_name: fullName, role: 'owner' };
  }

  async loginStartOwner(input: { phone: string }): Promise<{ dev_otp: string }> {
    if (!input?.phone) throw new BadRequestException('phone is required');
    const phone = normalizePhoneE164(input.phone);
    const isBlocked = await this.blocked.findOne({ where: { phone } });
    if (isBlocked) throw new BadRequestException('Phone is blocked');
    const user = await this.users.findOne({ where: { phone } });
    if (!user) throw new NotFoundException('No registration found for this phone');
    const otp = this.generateOtp();
    this.otps.set(phone, { otp, expiresAt: Date.now() + 5 * 60_000, userId: user.id, candidateId: '' as any });
    return { dev_otp: otp };
  }

  async loginVerifyOwner(input: { phone: string; otp: string }): Promise<{ token: string; user_id: string; agency_id?: string | null; user_type: string; phone: string; full_name?: string | null; role: string }> {
    return this.verifyOwner(input);
  }

  async memberLogin(input: { phone: string; password: string }): Promise<{ token: string; user_id: string; agency_id: string; user_type: string; role: string }> {
    if (!input?.phone || !input?.password) throw new BadRequestException('phone and password are required');
    const phone = normalizePhoneE164(input.phone);
    const au = await this.agencyUsers.findOne({ where: { phone } });
    if (!au || !au.password_hash) throw new BadRequestException('Invalid credentials');
    const ok = await bcrypt.compare(input.password, au.password_hash);
    if (!ok) throw new BadRequestException('Invalid credentials');

    const user = await this.users.findOne({ where: { id: au.user_id } });
    if (!user || user.role !== 'agency_user' || !user.agency_id) {
      throw new BadRequestException('Invalid member account');
    }

    // Check if member is suspended
    if (au.status === 'suspended') {
      throw new ForbiddenException('Your account has been suspended. Contact administrator.');
    }

    // Update member status to active on first login (if pending)
    if (au.status === 'pending') {
      au.status = 'active';
      await this.agencyUsers.save(au);
    }

    const token = await this.jwt.signAsync({ sub: user.id, aid: user.agency_id, role: 'agency_user' });
    return { token, user_id: user.id, agency_id: user.agency_id, user_type: 'member', role: au.role || 'staff' };
  }

  // --- Member OTP Login Flow ---
  async memberLoginStart(input: { phone: string }): Promise<{ dev_otp: string }> {
    if (!input?.phone) throw new BadRequestException('phone is required');
    const phone = normalizePhoneE164(input.phone);
    const isBlocked = await this.blocked.findOne({ where: { phone } });
    if (isBlocked) throw new BadRequestException('Phone is blocked');
    
    // Verify member exists
    const au = await this.agencyUsers.findOne({ where: { phone } });
    if (!au) throw new NotFoundException('Member not found');
    
    // Verify user exists and is active
    const user = await this.users.findOne({ where: { id: au.user_id } });
    if (!user || user.role !== 'agency_user' || !user.agency_id) {
      throw new BadRequestException('Invalid member account');
    }
    
    // Generate OTP
    const otp = this.generateOtp();
    this.otps.set(phone, { otp, expiresAt: Date.now() + 5 * 60_000, userId: user.id, candidateId: '' as any });
    
    // Send SMS with OTP
    // await this.sms.send(phone, `Your login OTP is: ${otp}`);
    
    return { dev_otp: otp };
  }

  async memberLoginVerify(input: { phone: string; otp: string }): Promise<{ token: string; user_id: string; agency_id: string; user_type: string; phone: string; full_name?: string | null; role: string }> {
    if (!input?.phone || !input?.otp) throw new BadRequestException('phone and otp are required');
    const phone = normalizePhoneE164(input.phone);
    
    // Verify OTP
    const rec = this.otps.get(phone);
    if (!rec) throw new BadRequestException('No OTP requested for this phone');
    if (Date.now() > rec.expiresAt) {
      this.otps.delete(phone);
      throw new BadRequestException('OTP expired');
    }
    if (rec.otp !== input.otp) throw new BadRequestException('Invalid OTP');
    
    // Get member details
    const au = await this.agencyUsers.findOne({ where: { phone } });
    if (!au) throw new NotFoundException('Member not found');
    
    const user = await this.users.findOne({ where: { id: au.user_id } });
    if (!user || user.role !== 'agency_user' || !user.agency_id) {
      throw new BadRequestException('Invalid member account');
    }
    
    // Check if member is suspended
    if (au.status === 'suspended') {
      throw new ForbiddenException('Your account has been suspended. Contact administrator.');
    }
    
    // Mark user as active
    if (!user.is_active) {
      user.is_active = true;
      await this.users.save(user);
    }
    
    // Update member status to active on first login (if pending)
    if (au.status === 'pending') {
      au.status = 'active';
      await this.agencyUsers.save(au);
    }
    
    // Generate JWT
    const token = await this.jwt.signAsync({ sub: user.id, aid: user.agency_id, role: 'agency_user' });
    
    // Clean up OTP
    this.otps.delete(phone);
    
    return { 
      token, 
      user_id: user.id, 
      agency_id: user.agency_id, 
      user_type: 'member',
      phone,
      full_name: au.full_name || null,
      role: au.role || 'staff'
    };
  }

  async initiatePhoneChange(candidateId: string, newPhone: string) {
    const candidate = await this.candidates.findById(candidateId);
    if (!candidate) throw new BadRequestException('Candidate not found');

    const user = await this.users.findOne({ where: { candidate_id: candidateId } });
    if (!user) throw new BadRequestException('User not found');

    const isBlocked = await this.blocked.findOne({ where: { phone: newPhone } });
    if (isBlocked) throw new BadRequestException('New phone is blocked');

    const otp = this.generateOtp();
    this.otps.set(newPhone, { otp, expiresAt: Date.now() + 5 * 60_000, userId: user.id, candidateId });
    return { dev_otp: otp };
  }

  async verifyPhoneChange(candidateId: string, newPhone: string, otp: string) {
    const rec = this.otps.get(newPhone);
    if (!rec) throw new BadRequestException('No OTP requested for this phone');
    if (Date.now() > rec.expiresAt) {
      this.otps.delete(newPhone);
      throw new BadRequestException('OTP expired');
    }
    if (rec.otp !== otp) throw new BadRequestException('Invalid OTP');

    const candidate = await this.candidates.findById(candidateId);
    if (!candidate) throw new BadRequestException('Candidate not found');

    const user = await this.users.findOne({ where: { candidate_id: candidateId } });
    if (!user) throw new BadRequestException('User not found');

    user.phone = newPhone;
    await this.users.save(user);
    // Update the candidate's phone
    candidate.phone = newPhone;
    await this.candidates.updateCandidate(candidateId, candidate);

    this.otps.delete(newPhone);
    return { message: 'Phone changed successfully' };
  }
}
