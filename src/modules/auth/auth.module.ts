import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../user/user.entity';
import { BlockedPhone } from './blocked-phone.entity';
import { CandidateModule } from '../candidate/candidate.module';
import { JwtModule } from '@nestjs/jwt';
import { AgencyUser } from '../agency/agency-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, BlockedPhone, AgencyUser]),
    forwardRef(() => CandidateModule),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
