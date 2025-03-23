// src/event-participation/dto/create-event-participation.dto.ts
import {IsId} from "../../common/validators/id.validator";

export class CreateEventParticipationDto {
    // @IsId(true)
    // calendarMemberId?: number; //TODO: надо ли вообще это передавать?

    @IsId(false)
    calendarId: number;

    @IsId(false)
    userId: number;
}
