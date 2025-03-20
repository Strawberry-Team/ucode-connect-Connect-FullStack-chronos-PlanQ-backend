import {CalendarRole} from '../entity/calendar-member.entity';
import {IsCalendarRole} from "../../calendar/calendars.validator";
import {IsUserEmail} from "../../user/users.validator";

export class AddMemberToCalendarDto {
    @IsUserEmail(false)
    userEmail: string;

    @IsCalendarRole(false)
    role: CalendarRole;
}
