// /calendar/calendars.validator.ts

import {applyDecorators} from '@nestjs/common';
import {IsEnum, IsOptional} from 'class-validator';
import {CalendarRole} from "../calendar-member/entity/calendar-member.entity";

export function IsCalendarRole(isOptional: boolean) {
    const decorators = [IsEnum(CalendarRole)];

    if (isOptional) {
        return applyDecorators(IsOptional(), ...decorators);
    } else {
        return applyDecorators(...decorators);
    }
}