import {createJwtGuard} from "src/jwt/jwt-guard.factory";

export const confirmParticipationGuard = createJwtGuard('confirm-participation');