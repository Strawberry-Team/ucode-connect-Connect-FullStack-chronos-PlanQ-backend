// src/event-participation/dto/create-event-participation.dto.ts
import {IsId} from "../../common/validators/id.validator";

export class CreateEventParticipationDto {
    @IsId(false)
    calendarId: number;

    @IsId(false)
    userId: number;
}
