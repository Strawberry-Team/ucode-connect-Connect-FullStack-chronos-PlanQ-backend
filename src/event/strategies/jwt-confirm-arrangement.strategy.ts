import {createJwtStrategy} from '../../jwt/jwt-strategy.factory';

const confirmArrangementExtractor = (req: any) => req?.params?.confirm_token;

const validateFn = (payload: any) => ({
    userId: payload.sub,
    arrangementId: payload.arrangementId,
});

export const JwtConfirmArrangementStrategy = createJwtStrategy({
    strategyName: 'jwt-confirm-arrangement',
    tokenType: 'confirmArrangement',
    extractor: confirmArrangementExtractor,
    validateFn,
});
