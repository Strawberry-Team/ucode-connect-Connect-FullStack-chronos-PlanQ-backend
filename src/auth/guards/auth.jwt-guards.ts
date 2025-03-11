import {createJwtGuard} from "../../jwt/jwt-guard.factory";

export const JwtAuthGuard = createJwtGuard('jwt-access');
export const JwtRefreshGuard = createJwtGuard('jwt-refresh');
export const JwtConfirmEmailGuard = createJwtGuard('jwt-confirm-email');
export const JwtResetPasswordGuard = createJwtGuard('jwt-password-reset');