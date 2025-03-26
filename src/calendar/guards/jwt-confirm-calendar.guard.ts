// src/calendar/guards/jwt-confirm-calendar.guard.ts
import {createJwtGuard} from "../../jwt/jwt-guard.factory";

export const JwtConfirmCalendarGuard = createJwtGuard('jwt-confirm-calendar');