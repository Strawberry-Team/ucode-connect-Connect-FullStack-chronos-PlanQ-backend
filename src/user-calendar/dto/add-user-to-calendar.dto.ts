// src/users-calendars/dto/add-user-to-calendar.dto.ts
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { CalendarRole } from '../entity/user-calendar.entity';
import {IsCalendarColor, IsCalendarRole} from "../../calendar/calendars.validator";
import {IsUserEmail} from "../../user/users.validator";

export class AddUserToCalendarDto {
    @IsUserEmail(false)
    userEmail: string;

    @IsCalendarRole(false)
    role: CalendarRole.EDITOR | CalendarRole.VIEWER;
}
