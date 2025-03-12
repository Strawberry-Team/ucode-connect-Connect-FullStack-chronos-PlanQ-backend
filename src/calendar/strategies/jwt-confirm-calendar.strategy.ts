import {createJwtStrategy} from '../../jwt/jwt-strategy.factory';

const confirmCalendarExtractor = (req: any): string | null => {
    return req?.params?.confirm_token || null;
};

const confirmCalendarValidateFn = (payload: any) => {
    return {userId: payload.sub, calendarId: payload.calendarId};
};

export const JwtConfirmCalendarStrategy = createJwtStrategy({
    strategyName: 'jwt-confirm-calendar',
    tokenType: 'confirmCalendar',
    extractor: confirmCalendarExtractor,
    validateFn: confirmCalendarValidateFn,
});
