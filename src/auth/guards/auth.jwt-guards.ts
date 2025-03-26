// src/auth/guards/auth.jwt-guards.ts
import {AuthGuard} from "@nestjs/passport";
import {createJwtGuard} from "../../jwt/jwt-guard.factory";
import {RefreshTokenNonceService} from "src/refresh-token-nonce/refresh-token-nonce.service";
import {CanActivate, ExecutionContext, ForbiddenException, Injectable} from "@nestjs/common";
import {Reflector} from '@nestjs/core';
import {IS_PUBLIC_KEY} from "src/common/decorators/public.decorator";

export const JwtConfirmEmailGuard = createJwtGuard('jwt-confirm-email');
export const JwtResetPasswordGuard = createJwtGuard('jwt-password-reset');

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt-access') implements CanActivate {
    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext): boolean {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        return super.canActivate(context) as boolean;
    }
}

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') implements CanActivate {
    constructor(private readonly refreshTokenNonceService: RefreshTokenNonceService) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const canActivate = await super.canActivate(context);
        if (!canActivate) return false;

        const request = context.switchToHttp().getRequest();

        const {user} = request;
        if (!user || !user.nonce) {
            throw new ForbiddenException("Refresh token does not contain nonce");
        }

        const nonceRecord = await this.refreshTokenNonceService.getRefreshTokenNonceByNonceAndUserId(
            user.userId,
            user.nonce
        );
        if (!nonceRecord) {
            throw new ForbiddenException("Invalid or expired refresh token");
        }

        return true;
    }
}

