import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarsController } from './calendars.controller';
import { CalendarsService } from './calendars.service';
import { CalendarsRepository } from './calendars.repository';
import { Calendar } from './entity/calendar.entity';
import { UsersModule } from '../user/users.module';
import { UsersCalendarsModule } from '../user-calendar/users-calendars.module';
import {GoogleOAuthService} from "../google/google-oauth.service";
import {ConfigService} from "@nestjs/config";
import {CalendarApiService} from "./calendar-api.service";
import {CalendarOwnerGuard} from "./guards/own.calendar.guard";

@Module({
    imports: [
        TypeOrmModule.forFeature([Calendar]),
        forwardRef(() => UsersModule),
        forwardRef(() => UsersCalendarsModule)
    ],
    controllers: [CalendarsController],
    providers: [CalendarsService, CalendarsRepository, CalendarApiService, GoogleOAuthService, ConfigService, CalendarOwnerGuard],
    exports: [CalendarApiService, CalendarsService, CalendarsRepository, CalendarOwnerGuard]
})
export class CalendarsModule {}
