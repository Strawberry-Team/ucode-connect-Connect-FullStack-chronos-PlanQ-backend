// src/event/dto/update-event.dto.ts
import {EventCategory} from '../entity/event.entity';
import {
    IsCalendarAndEventDescription,
    IsCalendarAndEventName
} from "../../common/validators/calendars.events.validator";
import {IsEventCategory, ValidateDatePair} from "../events.validator";
import {IsISO8601Date, IsLaterThan} from "../../common/validators/date.validator";
import {Transform} from "class-transformer";

export class UpdateEventDto {
    @IsCalendarAndEventName(true)
    name?: string;

    @IsCalendarAndEventDescription(true, true)
    description?: string;

    @IsEventCategory(true)
    category?: EventCategory;

    @IsISO8601Date(true)
    // @Transform(({value}) => new Date(value))
    startedAt?: Date;

    @IsLaterThan('startedAt')
    @IsISO8601Date(true)
    // @Transform(({value}) => new Date(value)) //TODO: провериь везде что нет new Date()
    endedAt?: Date;

    @ValidateDatePair()
    __dummyField?: never;
}
