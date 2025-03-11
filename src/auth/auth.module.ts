// auth.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
// import { AuthRepository } from '../token/token.repository';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtAuthGuard } from './guards/jwt-access.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { RefreshToken } from '../token/entities/refresh-token.entity';
import { JwtResetPasswordStrategy } from './strategies/jwt-reset-password.stategy';
import { JwtConfirmEmailStrategy } from './strategies/jwt-confirm-email.strategy';
import { JwtResetPasswordGuard } from './guards/jwt-reset-password.guard';
import { JwtConfirmEmailGuard } from './guards/jwt-confirm-email.guard';
import { UsersModule } from '../user/users.module'
import { JwtUtils } from 'src/common/utils/token.utils';
import { RefreshTokenModule } from 'src/token/refresh-token.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
    UsersModule,
    forwardRef(() => RefreshTokenModule),
  ],
  controllers: [AuthController],
  providers: [AuthService,
              JwtStrategy,
              JwtResetPasswordStrategy,
              JwtConfirmEmailStrategy, 
              JwtRefreshStrategy, 
              JwtAuthGuard,
              JwtRefreshGuard, 
              JwtResetPasswordGuard, 
              JwtConfirmEmailGuard,
              JwtUtils,
            ],
  exports: [AuthService],
})
export class AuthModule {}


