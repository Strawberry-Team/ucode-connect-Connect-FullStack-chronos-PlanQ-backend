// src/auth/strategies/jwt-confirm-calendar.strategy.ts
import { createJwtStrategy } from '../../jwt/jwt-strategy.factory';

const confirmCalendarExtractor = (req: any): string | null => {
    // Извлекаем токен из параметров запроса
    return req?.params?.confirm_token || null;
};

const confirmCalendarValidateFn = (payload: any) => {
    return { userId: payload.sub, calendarId: payload.calendarId };
};

export const JwtConfirmCalendarStrategy = createJwtStrategy({
    strategyName: 'jwt-confirm-calendar',
    tokenType: 'confirmCalendar',
    extractor: confirmCalendarExtractor,
    validateFn: confirmCalendarValidateFn,
});
