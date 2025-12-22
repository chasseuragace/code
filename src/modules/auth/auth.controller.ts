import { Body, Controller, HttpCode, Post, Req, Param, UseGuards, Get, UnauthorizedException } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterCandidateDto } from './dto/register.dto';
import { VerifyOtpDto } from './dto/verify.dto';
import { LoginStartDto } from './dto/login-start.dto';
import { RegisterOwnerDto } from './dto/register-owner.dto';
import { MemberLoginDto } from './dto/member-login.dto';
import { RequestPhoneChangeDto, VerifyPhoneChangeDto } from './dto/phone-change.dto';
import { Logger } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateFcmTokenDto } from './dto/update-fcm-token.dto';
import { GetUser } from './get-user.decorator';
import { User } from '../user/user.entity';
import { ROLE_PERMISSIONS, getActionsForRole } from '../../config/rolePermissions';

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

  @Post('me/fcm-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Update FCM token for the current user' })
  @ApiBody({ type: UpdateFcmTokenDto })
  @ApiResponse({ status: 200, description: 'FCM token updated' })
  async updateFcmToken(
    @Req() req: Request & { user: any },
    @Body() body: UpdateFcmTokenDto,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('Authenticated user not found in request');
    }

    const normalized = body.fcmToken && body.fcmToken.trim().length > 0 ? body.fcmToken : null;
    await this.auth.updateUserFcmToken(userId, normalized);

    return { success: true };
  }

  /**
   * Get permissions for the authenticated user's role
   * Used by frontend to determine which actions are available
   * Single source of truth for role-based permissions
   */
  @Get('permissions/my-role')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Get permissions for current user role',
    description: 'Returns the list of actions the authenticated user can perform based on their role. Used by frontend to show/hide UI elements.',
  })
  @ApiResponse({
    status: 200,
    description: 'User permissions retrieved successfully',
    schema: {
      properties: {
        role: { type: 'string', description: 'User role', example: 'recruiter' },
        actions: { type: 'array', items: { type: 'string' }, description: 'List of actions user can perform', example: ['shortlist', 'schedule_interview'] },
        timestamp: { type: 'string', format: 'date-time', description: 'Response timestamp' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing token' })
  async getMyPermissions(@GetUser() user?: User) {
    if (!user) {
      throw new UnauthorizedException('User not found in request');
    }

    const actions = getActionsForRole(user.role);

    return {
      role: user.role,
      actions: actions,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get available roles for team member assignment
   * Used by frontend to populate role dropdown when inviting members
   * Single source of truth from backend
   */
  @Get('roles/available')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Get available roles for team member assignment',
    description: 'Returns list of roles that can be assigned to team members. Used by frontend to populate role dropdowns.',
  })
  @ApiResponse({
    status: 200,
    description: 'Available roles retrieved successfully',
    schema: {
      properties: {
        roles: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              value: { type: 'string', description: 'Role value', example: 'recruiter' },
              label: { type: 'string', description: 'Role display name', example: 'Recruiter' },
              description: { type: 'string', description: 'Role description', example: 'Focuses on candidate sourcing and screening' },
            },
          },
          description: 'List of assignable roles',
        },
        timestamp: { type: 'string', format: 'date-time', description: 'Response timestamp' },
      },
    },
  })
  async getAvailableRoles() {
    // Return roles that can be assigned to team members (exclude owner, candidate, call_agent)
    const assignableRoles = ['admin', 'recruiter', 'coordinator', 'visa_officer', 'viewer'];
    
    const roles = assignableRoles.map(role => ({
      value: role,
      label: this.getRoleLabel(role),
      description: this.getRoleDescription(role),
    }));

    return {
      roles,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Helper to get role label
   */
  private getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      admin: 'Admin',
      recruiter: 'Recruiter',
      coordinator: 'Interview Coordinator',
      visa_officer: 'Visa Officer',
      viewer: 'Viewer',
    };
    return labels[role] || role;
  }

  /**
   * Helper to get role description
   */
  private getRoleDescription(role: string): string {
    const descriptions: Record<string, string> = {
      admin: 'Manages operations, team, and reports',
      recruiter: 'Focuses on candidate sourcing and screening',
      coordinator: 'Manages interview scheduling and coordination',
      visa_officer: 'Handles document verification and visa processing',
      viewer: 'Read-only access to view information',
    };
    return descriptions[role] || '';
  }
}

