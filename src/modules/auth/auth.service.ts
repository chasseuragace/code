import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
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

    // Issue OTP
    const otp = this.generateOtp();
    const candidateId = user.candidate_id!;
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
      await this.users.save(user);
    } else {
      user = this.users.create({ phone, role: 'owner', is_active: false, is_agency_owner: true });
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

  async verifyOwner(input: { phone: string; otp: string }): Promise<{ token: string; user_id: string }> {
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
    return { token, user_id: rec.userId };
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

  async loginVerifyOwner(input: { phone: string; otp: string }): Promise<{ token: string; user_id: string }> {
    return this.verifyOwner(input);
  }

  async memberLogin(input: { phone: string; password: string }): Promise<{ token: string; user_id: string; agency_id: string }> {
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
    const token = await this.jwt.signAsync({ sub: user.id, aid: user.agency_id, role: 'agency_user' });
    return { token, user_id: user.id, agency_id: user.agency_id };
  }
}
