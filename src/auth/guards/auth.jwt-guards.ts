import {createJwtGuard} from "../../jwt/jwt-guard.factory";

export const JwtAuthGuard = createJwtGuard('jwt-access');
export const JwtRefreshGuard = createJwtGuard('jwt-refresh'); //TODO: настроить при невалидном токене правильный ответ
export const JwtConfirmEmailGuard = createJwtGuard('jwt-confirm-email');
export const JwtResetPasswordGuard = createJwtGuard('jwt-password-reset');