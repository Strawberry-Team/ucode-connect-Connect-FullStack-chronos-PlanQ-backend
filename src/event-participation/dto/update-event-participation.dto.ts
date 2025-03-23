// src/event-participation/dto/update-event-participation.dto.ts
import {ResponseStatus} from '../entity/event-participation.entity';
import {IsCalendarAndEventColor} from "../../common/validators/calendars.events.validator";
import {IsEventParticipationResponseStatus} from "../event-participations.validator";

export class UpdateEventParticipationDto {
    @IsCalendarAndEventColor(true)
    color?: string;

    @IsEventParticipationResponseStatus(true)
    responseStatus?: ResponseStatus;
}
