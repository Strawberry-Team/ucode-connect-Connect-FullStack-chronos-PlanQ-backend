import {createJwtStrategy} from '../../jwt/jwt-strategy.factory';

const refreshTokenExtractor = (req: any): string | null => {
    return req?.body?.refreshToken || null;
};

const refreshValidateFn = (payload: any) => {
    //TODO: проверить есть ли refresh в БД!!!!!!!!!!!!!!!!!!!!!!
    return {userId: payload.sub};
};

export const JwtRefreshStrategy = createJwtStrategy({
    strategyName: 'jwt-refresh',
    tokenType: 'refresh',
    extractor: refreshTokenExtractor,
    validateFn: refreshValidateFn,
});
