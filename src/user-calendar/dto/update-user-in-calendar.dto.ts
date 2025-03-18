import {CalendarRole} from '../entity/user-calendar.entity';
import {IsCalendarColor, IsCalendarRole} from "../../calendar/calendars.validator";

export class UpdateUserInCalendarDto {
    @IsCalendarRole(true)
    role?: CalendarRole;

    @IsCalendarColor(true)
    color?: string;
}
