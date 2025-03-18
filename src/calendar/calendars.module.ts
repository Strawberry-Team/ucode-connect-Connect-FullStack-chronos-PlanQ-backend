// src/calendars/calendars.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarsController } from './calendars.controller';
import { CalendarsService } from './calendars.service';
import { CalendarsRepository } from './calendars.repository';
import { Calendar } from './entity/calendar.entity';
import { UsersModule } from '../users/users.module';
import { UsersCalendarsModule } from '../users-calendars/users-calendars.module';
import {GoogleOAuthService} from "../google/google-oauth.service";
import {ConfigService} from "@nestjs/config";
import {CalendarApiService} from "./calendar-api.service";
import {CalendarOwnerGuard} from "./guards/own.calendar.guard";

@Module({
    imports: [
        TypeOrmModule.forFeature([Calendar]),
        UsersModule,
        forwardRef(() => UsersCalendarsModule)
    ],
    controllers: [CalendarsController],
    providers: [CalendarsService, CalendarsRepository, CalendarApiService, GoogleOAuthService, ConfigService, CalendarOwnerGuard],
    exports: [CalendarApiService, CalendarsService, CalendarsRepository]
})
export class CalendarsModule {}
