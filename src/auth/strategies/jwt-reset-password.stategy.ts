// src/auth/strategies/jwt-reset-password.strategy.ts
import { createJwtStrategy } from '../../jwt/jwt-strategy.factory';

const passwordResetExtractor = (req: any): string | null => {
    // Извлекаем токен для сброса пароля из параметров запроса
    return req?.params?.confirm_token || null;
};

const resetPasswordValidateFn = (payload: any) => {
    return { userId: payload.sub };
};

export const JwtResetPasswordStrategy = createJwtStrategy({
    strategyName: 'jwt-password-reset',
    tokenType: 'resetPassword',
    extractor: passwordResetExtractor,
    validateFn: resetPasswordValidateFn,
});
