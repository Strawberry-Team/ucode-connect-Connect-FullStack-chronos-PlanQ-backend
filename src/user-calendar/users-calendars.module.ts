// src/users-calendars/users-calendars.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersCalendarsController } from './users-calendars.controller';
import { UsersCalendarsService } from './users-calendars.service';
import { UsersCalendarsRepository } from './users-calendars.repository';
import { UserCalendar } from './entity/user-calendar.entity';
import { UsersModule } from '../user/users.module';
import { CalendarsModule } from '../calendar/calendars.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([UserCalendar]),
        forwardRef(() => UsersModule),
        forwardRef(() => CalendarsModule)
    ],
    controllers: [UsersCalendarsController],
    providers: [UsersCalendarsService, UsersCalendarsRepository],
    exports: [UsersCalendarsService, UsersCalendarsRepository]
})
export class UsersCalendarsModule {}
