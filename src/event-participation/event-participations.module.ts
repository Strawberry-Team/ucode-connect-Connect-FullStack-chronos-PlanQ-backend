// src/event-participation/event-participations.module.ts
import {Module, forwardRef} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {EventParticipationsController} from './event-participations.controller';
import {EventParticipationsService} from './event-participations.service';
import {EventParticipationsRepository} from './event-participations.repository';
import {EventParticipation} from './entity/event-participation.entity';
import {UsersModule} from '../user/users.module';
import {CalendarMembersModule} from '../calendar-member/calendar-members.module';
import {EventsModule} from '../event/events.module';
import {EmailModule} from '../email/email.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([EventParticipation]),
        forwardRef(() => UsersModule),
        forwardRef(() => CalendarMembersModule),
        forwardRef(() => EventsModule),
        forwardRef(() => EmailModule)
    ],
    controllers: [EventParticipationsController],
    providers: [
        EventParticipationsService,
        EventParticipationsRepository
    ],
    exports: [EventParticipationsService, EventParticipationsRepository]
})
export class EventParticipationsModule {
}
