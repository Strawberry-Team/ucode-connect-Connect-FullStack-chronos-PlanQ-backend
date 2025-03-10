// token.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenService } from './token.service';
import { TokenRepository } from './token.repository';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/index';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Token } from '../token/entities/token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Token]),
    JwtModule.register({

    }),
  ],
  controllers: [],
  providers: [TokenService, TokenRepository, JwtStrategy, JwtRefreshStrategy, JwtAuthGuard],
  exports: [TokenService],
})
export class AuthModule {}
