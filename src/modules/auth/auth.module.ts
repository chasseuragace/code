import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../user/user.entity';
import { BlockedPhone } from './blocked-phone.entity';
import { CandidateModule } from '../candidate/candidate.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AgencyUser } from '../agency/agency-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, BlockedPhone, AgencyUser]),
    CandidateModule,
    JwtModule.register({
      global: true,
      secret: process.env.AUTH_JWT_SECRET || 'dev-jwt-secret',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [AuthService, JwtAuthGuard],
  controllers: [AuthController],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
