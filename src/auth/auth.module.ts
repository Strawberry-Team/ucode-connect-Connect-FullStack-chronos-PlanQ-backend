// auth.module.ts
import {forwardRef, Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {AuthService} from './auth.service';
import {AuthController} from './auth.controller';
// import { AuthRepository } from '../token/token.repository';
import {JwtModule} from '@nestjs/jwt';
import {JwtAccessStrategy} from './strategies/jwt-access.strategy';
import {JwtRefreshStrategy} from './strategies/jwt-refresh.strategy';
import {RefreshToken} from '../token/entities/refresh-token.entity';
import {JwtResetPasswordStrategy} from './strategies/jwt-reset-password.stategy';
import {JwtConfirmEmailStrategy} from './strategies/jwt-confirm-email.strategy';
import {UsersModule} from '../user/users.module'
import {JwtUtils} from 'src/jwt/jwt-token.utils';
import {RefreshTokenModule} from 'src/token/refresh-token.module';
import {
    JwtAuthGuard,
    JwtRefreshGuard,
    JwtResetPasswordGuard,
    JwtConfirmEmailGuard
} from 'src/auth/guards/auth.jwt-guards';

@Module({
    imports: [
        UsersModule,
        forwardRef(() => RefreshTokenModule),
    ],
    controllers: [AuthController],
    providers: [AuthService,
        JwtAccessStrategy,
        JwtResetPasswordStrategy,
        JwtConfirmEmailStrategy,
        JwtRefreshStrategy,
        JwtAuthGuard,
        JwtRefreshGuard,
        JwtResetPasswordGuard,
        JwtConfirmEmailGuard,
    ],
    exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {
}


