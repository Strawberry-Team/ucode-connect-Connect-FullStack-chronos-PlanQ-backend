import {applyDecorators} from '@nestjs/common';
import {IsEnum, IsOptional} from 'class-validator';
import {CalendarRole} from "../user-calendar/entity/user-calendar.entity";

export function IsCalendarRole(isOptional: boolean) {
    const decorators = [IsEnum(CalendarRole)];

    if (isOptional) {
        return applyDecorators(IsOptional(), ...decorators);
    } else {
        return applyDecorators(...decorators);
    }
}