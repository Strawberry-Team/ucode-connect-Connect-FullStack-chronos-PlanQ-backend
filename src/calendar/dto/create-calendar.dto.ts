// src/calendars/dto/create-calendar.dto.ts
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import {IsCalendarColor, IsCalendarDescription, IsCalendarName} from '../calendars.validator';

export class CreateCalendarDto {
    @IsCalendarName(false)
    name: string;

    @IsCalendarDescription(true)
    description?: string;

    @IsCalendarColor(false)
    color: string;
}
