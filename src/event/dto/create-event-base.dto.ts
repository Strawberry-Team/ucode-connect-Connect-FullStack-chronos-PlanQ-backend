// src/event/dto/create-event.dto.ts
import {EventCategory, EventType} from '../entity/event.entity';
import {
    IsCalendarAndEventDescription,
    IsCalendarAndEventName
} from "../../common/validators/calendars.events.validator";
import {IsEventCategory, IsEventType} from "../events.validator";
import {IsISO8601Date} from "../../common/validators/date.validator";
import {IsLaterThan} from "../../common/validators/date.validator";
import {IsId} from "../../common/validators/id.validator";

export class CreateEventBaseDto {
    @IsCalendarAndEventName(false)
    name: string;

    @IsCalendarAndEventDescription(true)
    description?: string;

    @IsEventCategory(false)
    category: EventCategory;

    @IsISO8601Date(false)
    startedAt: string;

    @IsISO8601Date(false)
    @IsLaterThan('startedAt')
    endedAt: string;

    @IsCalendarAndEventDescription(false)
    color: string;

    @IsEventType(false)
    type: EventType;

    @IsId(false)
    calendarId: number;
}
