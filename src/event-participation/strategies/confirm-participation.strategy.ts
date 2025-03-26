import {createJwtStrategy} from '../../jwt/jwt-strategy.factory';

const confirmEmailExtractor = (req: any): string | null => {
    return req?.params?.confirm_token || null;
};

const confirmEmailValidateFn = (payload: any) => {
    return {eventParticipationId: payload.eventParticipationId};
};

// const token = this.jwtUtils.generateToken({
//     sub: userId,
//     eventParticipationId: participationId
// }, 'confirmArrangement');

export const JwtConfirmEmailStrategy = createJwtStrategy({
    strategyName: 'confirm-participation',
    tokenType: 'confirmArrangement',
    extractor: confirmEmailExtractor,
    validateFn: confirmEmailValidateFn,
});
