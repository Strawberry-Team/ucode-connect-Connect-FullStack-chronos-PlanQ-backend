// token.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshTokenService } from './refresh-token.service';
import { RefreshTokenRepository } from './refresh-token.repository';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../auth/strategies/jwt-access.strategy';
//import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
//import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshToken } from './entities/refresh-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken]),
    JwtModule.register({

    }),
  ],
  controllers: [],
  providers: [RefreshTokenService, RefreshTokenRepository, JwtStrategy],
  exports: [RefreshTokenService],
})
export class RefreshTokenModule {}
