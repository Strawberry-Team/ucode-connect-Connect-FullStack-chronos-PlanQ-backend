import {CalendarRole} from '../entity/user-calendar.entity';
import {IsCalendarRole} from "../../calendar/calendars.validator";
import {IsUserEmail} from "../../user/users.validator";

export class AddUserToCalendarDto {
    @IsUserEmail(false)
    userEmail: string;

    @IsCalendarRole(false)
    role: CalendarRole;
}
