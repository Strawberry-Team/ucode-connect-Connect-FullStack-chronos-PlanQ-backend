// src/auth/strategies/jwt-access.strategy.ts

import { createJwtStrategy } from '../../jwt/jwt-strategy.factory';
import { ExtractJwt } from 'passport-jwt';

const accessExtractor = ExtractJwt.fromAuthHeaderAsBearerToken();

const accessValidateFn = (payload: any) => ({
    userId: payload.sub,
});

export const JwtAccessStrategy = createJwtStrategy({
    strategyName: 'jwt-access',
    tokenType: 'access',
    extractor: accessExtractor,
    validateFn: accessValidateFn,
});
