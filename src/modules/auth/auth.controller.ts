import { Body, Controller, HttpCode, Post, Req, Param } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterCandidateDto } from './dto/register.dto';
import { VerifyOtpDto } from './dto/verify.dto';
import { LoginStartDto } from './dto/login-start.dto';
import { RegisterOwnerDto } from './dto/register-owner.dto';
import { MemberLoginDto } from './dto/member-login.dto';
import { RequestPhoneChangeDto, VerifyPhoneChangeDto } from './dto/phone-change.dto';
import { Logger } from '@nestjs/common';
import { Request } from 'express';

@ApiTags('auth')
@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @HttpCode(200)
  @ApiOperation({ summary: 'Register candidate by phone (OTP flow). Dev returns dev_otp' })
  @ApiBody({ type: RegisterCandidateDto })
  @ApiResponse({ status: 200, description: 'OTP issued', schema: { properties: { dev_otp: { type: 'string' } } } })
  async register(@Body() body: RegisterCandidateDto) {
    return this.auth.registerCandidate(body);
  }

  @Post('verify')
  @HttpCode(200)
  @ApiOperation({ summary: 'Verify OTP and return dev token' })
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({ status: 200, description: 'Token issued', schema: { properties: { token: { type: 'string' }, user_id: { type: 'string', format: 'uuid' }, candidate_id: { type: 'string', format: 'uuid' }, candidate: { type: 'object' } } } })
  async verify(@Body() body: VerifyOtpDto) {
    return this.auth.verifyOtp(body);
  }

  @Post('login/start')
  @HttpCode(200)
  @ApiOperation({ summary: 'Start login OTP flow' })
  @ApiBody({ type: LoginStartDto })
  @ApiResponse({ status: 200, description: 'OTP issued', schema: { properties: { dev_otp: { type: 'string' } } } })
  async loginStart(@Body() body: LoginStartDto) {
    this.logger.log(`Received login/start request for phone: ${body.phone}`);
    return this.auth.loginStart(body);
  }

  @Post('login/verify')
  @HttpCode(200)
  @ApiOperation({ summary: 'Verify login OTP and return token' })
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({ status: 200, description: 'Token issued', schema: { properties: { token: { type: 'string' }, user_id: { type: 'string', format: 'uuid' }, candidate_id: { type: 'string', format: 'uuid' }, candidate: { type: 'object' } } } })
  async loginVerify(@Body() body: VerifyOtpDto) {
    this.logger.log(`Received login/verify request for phone: ${body.phone}`);
    return this.auth.loginVerify(body);
  }

  // --- Agency Owner OTP endpoints ---
  @Post('agency/register-owner')
  @HttpCode(200)
  @ApiOperation({ summary: 'Register agency owner (phone only). Dev returns dev_otp' })
  @ApiBody({ type: RegisterOwnerDto })
  @ApiResponse({ status: 200, description: 'OTP issued', schema: { properties: { dev_otp: { type: 'string' } } } })
  async registerOwner(@Body() body: RegisterOwnerDto) {
    return this.auth.registerOwner(body);
  }

  @Post('agency/verify-owner')
  @HttpCode(200)
  @ApiOperation({ summary: 'Verify owner OTP and return JWT token' })
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({ status: 200, description: 'Token issued', schema: { properties: { token: { type: 'string' }, user_id: { type: 'string', format: 'uuid' } } } })
  async verifyOwner(@Body() body: VerifyOtpDto) {
    return this.auth.verifyOwner(body);
  }

  @Post('agency/login/start-owner')
  @HttpCode(200)
  @ApiOperation({ summary: 'Start login OTP for agency owner' })
  @ApiBody({ type: LoginStartDto })
  @ApiResponse({ status: 200, description: 'OTP issued', schema: { properties: { dev_otp: { type: 'string' } } } })
  async loginStartOwner(@Body() body: LoginStartDto) {
    return this.auth.loginStartOwner(body);
  }

  @Post('agency/login/verify-owner')
  @HttpCode(200)
  @ApiOperation({ summary: 'Verify login OTP for agency owner' })
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({ status: 200, description: 'Token issued', schema: { properties: { token: { type: 'string' }, user_id: { type: 'string', format: 'uuid' } } } })
  async loginVerifyOwner(@Body() body: VerifyOtpDto) {
    return this.auth.loginVerifyOwner(body);
  }

  @Post('member/login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Agency member login with phone+password' })
  @ApiBody({ type: MemberLoginDto })
  @ApiResponse({ status: 200, description: 'Token issued', schema: { properties: { token: { type: 'string' }, user_id: { type: 'string', format: 'uuid' }, agency_id: { type: 'string', format: 'uuid' } } } })
  async memberLogin(@Body() body: MemberLoginDto) {
    return this.auth.memberLogin(body);
  }

  @Post('member/login/start')
  @HttpCode(200)
  @ApiOperation({ summary: 'Start member login OTP flow' })
  @ApiBody({ type: LoginStartDto })
  @ApiResponse({ status: 200, description: 'OTP issued', schema: { properties: { dev_otp: { type: 'string' } } } })
  async memberLoginStart(@Body() body: LoginStartDto) {
    return this.auth.memberLoginStart(body);
  }

  @Post('member/login/verify')
  @HttpCode(200)
  @ApiOperation({ summary: 'Verify member login OTP' })
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({ status: 200, description: 'Token issued', schema: { properties: { token: { type: 'string' }, user_id: { type: 'string', format: 'uuid' }, agency_id: { type: 'string', format: 'uuid' }, user_type: { type: 'string' }, phone: { type: 'string' }, full_name: { type: 'string' } } } })
  async memberLoginVerify(@Body() body: VerifyOtpDto) {
    return this.auth.memberLoginVerify(body);
  }

  @Post('phone-change-requests')
  @ApiBody({ type: RequestPhoneChangeDto })
  @ApiResponse({ status: 200, description: 'OTP sent to new phone number' })
  async requestPhoneChange(
    @Body() body: RequestPhoneChangeDto,
  ) {
    if (!body.candidateId) throw new Error('Invalid candidate');
    const result = await this.auth.initiatePhoneChange(body.candidateId, body.newPhone);
    return { message: 'OTP sent to new phone number', dev_otp: result.dev_otp };
  }

  @Post('phone-change-verifications')
  @ApiBody({ type: VerifyPhoneChangeDto })
  @ApiResponse({ status: 200, description: 'Phone number changed successfully' })
  async verifyPhoneChange(
    @Body() body: VerifyPhoneChangeDto,
  ) {
    if (!body.candidateId) throw new Error('Invalid candidate');
    await this.auth.verifyPhoneChange(body.candidateId, body.newPhone, body.otp);
    return { message: 'Phone number changed successfully' };
  }
}
