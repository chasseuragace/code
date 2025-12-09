import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuditLog } from './audit.entity';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { AuditMiddleware } from './audit.middleware';
import { User } from '../user/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog, User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret',
      signOptions: { expiresIn: '7d' },
    }),
    AuthModule,
  ],
  controllers: [AuditController],
  providers: [AuditService, AuditMiddleware],
  exports: [AuditService, AuditMiddleware],
})
export class AuditModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply audit middleware to all routes
    consumer.apply(AuditMiddleware).forRoutes('*');
  }
}
