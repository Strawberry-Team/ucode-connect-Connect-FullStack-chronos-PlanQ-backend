// src/auth/strategies/jwt-refresh.strategy.ts
import { createJwtStrategy } from '../../jwt/jwt-strategy.factory';

const refreshTokenExtractor = (req: any): string | null => {
  // Принимаем refresh-токен из тела запроса
  return req?.body?.refreshToken || null;
};

const refreshValidateFn = (payload: any) => {
  // Можно добавить доп. проверку или логику, например, сверку с БД
  //TODO: проверить есть ли refresh в БД!!!!!!!!!!!!!!!!!!!!!!
  return { userId: payload.sub };
};

export const JwtRefreshStrategy = createJwtStrategy({
  strategyName: 'jwt-refresh',
  tokenType: 'refresh',
  extractor: refreshTokenExtractor,
  validateFn: refreshValidateFn,
});
