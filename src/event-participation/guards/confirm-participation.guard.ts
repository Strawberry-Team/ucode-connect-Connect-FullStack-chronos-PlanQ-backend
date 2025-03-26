// src/event-participation/guards/confirm-participation.guard.ts
import {createJwtGuard} from "src/jwt/jwt-guard.factory";

export const confirmParticipationGuard = createJwtGuard('confirm-participation');