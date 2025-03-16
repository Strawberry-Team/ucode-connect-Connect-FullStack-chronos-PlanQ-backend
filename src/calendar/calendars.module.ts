import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {GoogleOAuthService} from "../google/google-oauth.service";
import {ConfigService} from "@nestjs/config";
import {CalendarApiService} from "./calendar-api.service";
// import { CalendarsController } from './calendars.controller';
// import { CalendarsService } from './calendars.service';
// import { CalendarsRepository } from './calendars.repository';
// import { Calendar } from './entity/calendar.entity';

@Module({
    // imports: [TypeOrmModule.forFeature([Calendar])],
    // controllers: [CalendarsController],
    // providers: [CalendarsService, CalendarsRepository, CalendarApiService, GoogleOAuthService, ConfigService],
    // exports: [CalendarApiService, CalendarsService, CalendarsRepository],
    controllers: [],
    providers: [CalendarApiService, GoogleOAuthService, ConfigService],
    exports: [CalendarApiService],
})
export class CalendarsModule {}
