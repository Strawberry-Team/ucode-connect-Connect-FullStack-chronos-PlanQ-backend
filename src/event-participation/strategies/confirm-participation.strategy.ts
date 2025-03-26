// src/event-participation/strategies/confirm-participation.strategy.ts
import {createJwtStrategy} from '../../jwt/jwt-strategy.factory';

const confirmEmailExtractor = (req: any): string | null => {
    return req?.params?.confirm_token || null;
};

const confirmEmailValidateFn = (payload: any) => {
    return {eventParticipationId: payload.eventParticipationId};
};

export const JwtConfirmArrangementStrategy = createJwtStrategy({
    strategyName: 'confirm-participation',
    tokenType: 'confirmArrangement',
    extractor: confirmEmailExtractor,
    validateFn: confirmEmailValidateFn,
});
