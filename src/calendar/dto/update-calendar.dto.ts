// src/calendars/dto/update-calendar.dto.ts
import { IsOptional, IsString, MaxLength } from 'class-validator';
import {IsCalendarColor, IsCalendarDescription, IsCalendarName} from '../calendars.validator';

export class UpdateCalendarDto {
    @IsCalendarName(true)
    name?: string;

    @IsCalendarDescription(true, true)
    description?: string | null;
}
