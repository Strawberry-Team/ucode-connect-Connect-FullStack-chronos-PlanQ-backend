import {CalendarRole} from '../entity/user-calendar.entity';
import {IsCalendarAndEventColor} from '../../common/validators/calendars.events.validator';
import {IsCalendarRole} from "../../calendar/calendars.validator";

export class UpdateUserInCalendarDto {
    @IsCalendarRole(true)
    role?: CalendarRole;

    @IsCalendarAndEventColor(true)
    color?: string;
}
