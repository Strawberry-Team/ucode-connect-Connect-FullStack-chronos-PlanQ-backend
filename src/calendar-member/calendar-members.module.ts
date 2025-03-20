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

@Module({
    imports: [
        TypeOrmModule.forFeature([CalendarMember]),
        forwardRef(() => UsersModule),
        forwardRef(() => CalendarsModule),
        forwardRef(() => EmailModule)
    ],
    controllers: [CalendarMembersController],
    providers: [CalendarMembersService, CalendarMembersRepository, UpdateCalendarMemberGuard, OwnCalendarMemberGuard],
    exports: [CalendarMembersService, CalendarMembersRepository, OwnCalendarMemberGuard]
})
export class CalendarMembersModule {
}
