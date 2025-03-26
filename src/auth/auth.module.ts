// src/auth/auth.module.ts
import {forwardRef, Module} from '@nestjs/common';
import {AuthService} from './auth.service';
import {AuthController} from './auth.controller';
import {JwtAccessStrategy} from './strategies/jwt-access.strategy';
import {JwtRefreshStrategy} from './strategies/jwt-refresh.strategy';
import {JwtResetPasswordStrategy} from './strategies/jwt-reset-password.stategy';
import {JwtConfirmEmailStrategy} from './strategies/jwt-confirm-email.strategy';
import {UsersModule} from '../user/users.module'
import {RefreshTokenNonceModule} from 'src/refresh-token-nonce/refresh-token-nonce.module';
import {
    JwtAuthGuard,
    JwtRefreshGuard,
    JwtResetPasswordGuard,
    JwtConfirmEmailGuard
} from 'src/auth/guards/auth.jwt-guards';
import {EmailModule} from 'src/email/email.module';

@Module({
    imports: [
        UsersModule,
        EmailModule,
        forwardRef(() => RefreshTokenNonceModule),
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
        JwtConfirmEmailGuard
    ],
    exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {
}
