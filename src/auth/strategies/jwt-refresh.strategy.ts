import {createJwtStrategy} from '../../jwt/jwt-strategy.factory';

const refreshTokenExtractor = (req: any): string | null => {
    return req?.body?.refreshToken || null;
};

const refreshValidateFn = (payload: any) => {
    console.log("nonce: payload.nonce", payload.nonce)
    return {userId: payload.sub,
            nonce: payload.nonce,
            expiresIn: payload.exp,
            createdAt: payload.iat
    };
};

export const JwtRefreshStrategy = createJwtStrategy({
    strategyName: 'jwt-refresh',
    tokenType: 'refresh',
    extractor: refreshTokenExtractor,
    validateFn: refreshValidateFn,
});
