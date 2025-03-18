import { AuthGuard } from "@nestjs/passport";
import { createJwtGuard } from "../../jwt/jwt-guard.factory";
import { RefreshTokenNonceService } from "src/refresh-token-nonce/refresh-token-nonce.service";
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";

export const JwtAuthGuard = createJwtGuard('jwt-access');
export const JwtConfirmEmailGuard = createJwtGuard('jwt-confirm-email');
export const JwtResetPasswordGuard = createJwtGuard('jwt-password-reset');

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') implements CanActivate {
    constructor(private readonly refreshTokenNonceService: RefreshTokenNonceService) { super(); }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const canActivate = await super.canActivate(context);
        if (!canActivate) return false;

        const request = context.switchToHttp().getRequest();

        const { user } = request;
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

