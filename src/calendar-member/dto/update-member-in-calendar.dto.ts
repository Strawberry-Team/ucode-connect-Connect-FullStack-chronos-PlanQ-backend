// src/calendar-member/dto/update-member-in-calendar.dto.ts
import {CalendarRole} from '../entity/calendar-member.entity';
import {IsCalendarAndEventColor} from '../../common/validators/calendars.events.validator';
import {IsCalendarRole} from "../../calendar/calendars.validator";
import {IsBooleanField} from 'src/common/validators/is-boolean-field.validator';
import {ValidateSingleFieldUpdate} from "../../common/validators/only-one-field.validator";

export class UpdateMemberInCalendarDto {
    @IsCalendarRole(true)
    role?: CalendarRole;

    @IsCalendarAndEventColor(true)
    color?: string;

    @IsBooleanField(true)
    isVisible?: boolean;

    @ValidateSingleFieldUpdate()
    __dummyField?: never;
}
