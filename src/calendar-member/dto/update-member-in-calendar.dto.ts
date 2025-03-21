import {CalendarRole} from '../entity/calendar-member.entity';
import {IsCalendarAndEventColor} from '../../common/validators/calendars.events.validator';
import {IsCalendarRole} from "../../calendar/calendars.validator";
import {IsBooleanField} from 'src/common/validators/is-boolean-field.validator';

export class UpdateMemberInCalendarDto {
    @IsCalendarRole(true)
    role?: CalendarRole;

    @IsCalendarAndEventColor(true)
    color?: string;

    @IsBooleanField(true)
    isVisible?: boolean;
}
