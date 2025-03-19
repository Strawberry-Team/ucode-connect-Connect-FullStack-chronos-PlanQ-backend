import {createJwtGuard} from "../../jwt/jwt-guard.factory";

export const JwtConfirmCalendarGuard = createJwtGuard('jwt-confirm-calendar');