import {Module, forwardRef} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CalendarMembersController} from './calendar-members.controller';
import {CalendarMembersService} from './calendar-members.service';
import {CalendarMembersRepository} from './calendar-members.repository';
import {CalendarMember} from './entity/calendar-member.entity';
import {UsersModule} from '../user/users.module';
import {CalendarsModule} from '../calendar/calendars.module';
import {UpdateCalendarMemberGuard} from "./guards/update.calendar-member.guard";
import {OwnCalendarMemberGuard} from "./guards/own.calendar-member.guard";
import { EmailModule } from 'src/email/email.module';
import {EventParticipationsService} from "../event-participation/event-participations.service";
import {EventParticipationsModule} from "../event-participation/event-participations.module";
import {EventsService} from "../event/events.service";
import {EventsModule} from "../event/events.module";
import {EventTasksService} from "../event-task/event-tasks.service";
import {EventTasksModule} from "../event-task/event-tasks.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([CalendarMember]),
        forwardRef(() => UsersModule),
        forwardRef(() => CalendarsModule),
        forwardRef(() => EmailModule),
        forwardRef(() => EventParticipationsModule),
        forwardRef(() => EventsModule),
        forwardRef(() => EventTasksModule),
    ],
    controllers: [CalendarMembersController],
    providers: [CalendarMembersService, CalendarMembersRepository, UpdateCalendarMemberGuard, OwnCalendarMemberGuard, EventParticipationsService, EventsService, EventTasksService],
    exports: [CalendarMembersService, CalendarMembersRepository, OwnCalendarMemberGuard]
})
export class CalendarMembersModule {
}
