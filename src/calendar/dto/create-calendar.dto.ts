// calendar/dto/create-calendar.dto.ts
import {
    IsCalendarAndEventColor,
    IsCalendarAndEventDescription,
    IsCalendarAndEventName
} from '../../common/validators/calendars.events.validator';

export class CreateCalendarDto {
    @IsCalendarAndEventName(false)
    name: string;

    @IsCalendarAndEventDescription(true)
    description?: string;

    @IsCalendarAndEventColor(false)
    color: string;
}
