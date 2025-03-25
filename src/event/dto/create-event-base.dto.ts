// src/event/dto/create-event.dto.ts
import {EventCategory, EventType} from '../entity/event.entity';
import {
    IsCalendarAndEventDescription,
    IsCalendarAndEventName
} from "../../common/validators/calendars.events.validator";
import {IsEventCategory, IsEventType} from "../events.validator";
import {IsISO8601Date} from "../../common/validators/date.validator";
import {Transform} from "class-transformer";
import {IsLaterThan} from "../../common/validators/date.validator";
import {IsId} from "../../common/validators/id.validator";
import { IsNotEmpty, isNotEmpty } from 'class-validator';

export class CreateEventBaseDto {
    @IsCalendarAndEventName(false)
    name: string;

    @IsCalendarAndEventDescription(true)
    description?: string;

    @IsEventCategory(false)
    category: EventCategory;

    @IsISO8601Date(false)
    // @Transform(({value, obj}) => {
    //     // console.log('Transform context startedAt:', { value, obj });
    //     return new Date(value);
    // })
    startedAt: string;

    @IsISO8601Date(false)
    @IsLaterThan('startedAt')
    // @Transform(({value, obj}) => {
    //     // console.log('Transform context endedAt:', { value, obj });
    //     return new Date(value);
    // })
    endedAt: string;

    @IsCalendarAndEventDescription(false) 
    color: string;

    @IsEventType(false)
    type: EventType;

    @IsId(false)
    calendarId: number;
}
