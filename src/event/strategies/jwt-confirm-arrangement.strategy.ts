// src/auth/strategies/jwt-confirm-arrangement.strategy.ts

import { createJwtStrategy } from '../../jwt/jwt-strategy.factory';
import { ExtractJwt } from 'passport-jwt';

// Функция-извлекатель токена – берем токен из параметров запроса
const confirmArrangementExtractor = (req: any) => req?.params?.confirm_token;

// Функция validate для подтверждения соглашения
const validateFn = (payload: any) => ({
    userId: payload.sub,
    arrangementId: payload.arrangementId,
});

// Экспортируем класс стратегии, созданной фабрикой
export const JwtConfirmArrangementStrategy = createJwtStrategy({
    strategyName: 'jwt-confirm-arrangement',
    tokenType: 'confirmArrangement',
    extractor: confirmArrangementExtractor,
    validateFn,
});
