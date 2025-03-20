import {CalendarRole} from '../entity/user-calendar.entity';
import {IsCalendarAndEventColor} from '../../common/validators/calendars.events.validator';
import {IsCalendarRole} from "../../calendar/calendars.validator";
import { IsBoolean, IsOptional } from 'class-validator';
import { IsBooleanField } from 'src/common/validators/is-boolean-field.validator';

export class UpdateUserInCalendarDto {
    @IsCalendarRole(true)
    role?: CalendarRole;

    @IsCalendarAndEventColor(true)
    color?: string;

    @IsBooleanField(true)
    isVisible?: boolean;
}
