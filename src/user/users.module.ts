import {forwardRef, Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {UsersController} from './users.controller';
import {UsersService} from './users.service';
import {UsersRepository} from './users.repository';
import {User} from './entity/user.entity';
import {CountryModule} from 'src/country/country.module';
import {PasswordService} from "./passwords.service";
import {OwnAccountGuard} from './guards/own-account.guard';
import {CalendarsModule} from "../calendar/calendars.module";
import {CalendarMembersModule} from "../calendar-member/calendar-members.module";
import {EventParticipationsModule} from "../event-participation/event-participations.module";
import {EventsModule} from "../event/events.module";
import {EventTasksModule} from "../event-task/event-tasks.module";
import {EventsService} from "../event/events.service";
import {EventTasksService} from "../event-task/event-tasks.service";
import {EventParticipationsService} from "../event-participation/event-participations.service";
import {EmailModule} from "../email/email.module";
import {EmailService} from "../email/email.service";
import {GoogleOAuthService} from "../google/google-oauth.service";
import {GoogleModule} from "../google/google.module";


@Module({
    imports: [TypeOrmModule.forFeature([User]), CountryModule, CalendarsModule, CalendarMembersModule, EmailModule, GoogleModule,
        forwardRef(() => EventsModule),
        forwardRef(() => EventTasksModule),
        forwardRef(() => EventParticipationsModule),
    ],
    controllers: [UsersController],
    providers: [
        UsersService,
        UsersRepository,
        PasswordService,
        OwnAccountGuard,
        GoogleOAuthService,
        EmailService,
        EventsService,
        EventTasksService,
        EventParticipationsService
    ],
    exports: [
        UsersService,
        UsersRepository,
        PasswordService
    ],
})
export class UsersModule {
}
