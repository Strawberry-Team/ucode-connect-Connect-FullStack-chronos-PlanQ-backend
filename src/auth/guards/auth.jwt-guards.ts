import { AuthGuard } from "@nestjs/passport";
import {createJwtGuard} from "../../jwt/jwt-guard.factory";
import { RefreshTokenService } from "src/token/refresh-token.service";
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";

export const JwtAuthGuard = createJwtGuard('jwt-access');
export const JwtConfirmEmailGuard = createJwtGuard('jwt-confirm-email');
export const JwtResetPasswordGuard = createJwtGuard('jwt-password-reset');

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') implements CanActivate  {
    constructor(private readonly refreshTokenService: RefreshTokenService) { super(); } 

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const canActivate = await super.canActivate(context);
        if (!canActivate) return false;

        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const refreshToken = request.body.refreshToken;

        const allTokens = await this.refreshTokenService.getAll();
        const onlyTokens = allTokens.map(token => token.refreshToken);
        const tokenExists: boolean = onlyTokens.includes(refreshToken);
        
        if (!tokenExists) {
            throw new ForbiddenException('Invalid or expired refresh token');
        }

        return true;
    }
} 
    
    
    
    //TODO: настроить при невалидном токене правильный ответ //TODO когда остается 29 дней - обновляет и отозвать тот, который он передал.
