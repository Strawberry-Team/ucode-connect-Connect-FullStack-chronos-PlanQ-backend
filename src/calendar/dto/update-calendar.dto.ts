import {IsCalendarDescription, IsCalendarName} from '../calendars.validator';

export class UpdateCalendarDto {
    @IsCalendarName(true)
    name?: string;

    @IsCalendarDescription(true, true)
    description?: string;
}
