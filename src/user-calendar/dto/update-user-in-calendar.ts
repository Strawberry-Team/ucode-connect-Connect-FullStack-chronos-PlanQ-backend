// src/users-calendars/dto/update-user-in-calendar.dto.ts
import { IsEnum, IsNotEmpty } from 'class-validator';
import { CalendarRole } from '../entity/user-calendar.entity';
import {IsCalendarColor, IsCalendarRole} from "../../calendar/calendars.validator";

export class UpdateUserInCalendarDto {
    @IsCalendarRole(true)
    role?: CalendarRole.EDITOR | CalendarRole.VIEWER;

    @IsCalendarColor(true)
    color?: string;
}
