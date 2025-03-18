import {IsCalendarColor, IsCalendarDescription, IsCalendarName} from '../calendars.validator';

export class CreateCalendarDto {
    @IsCalendarName(false)
    name: string;

    @IsCalendarDescription(true)
    description?: string;

    @IsCalendarColor(false)
    color: string;
}
