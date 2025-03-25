// src/event/events.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { EventsRepository } from './events.repository';
import { Event } from './entity/event.entity';
import { UsersModule } from '../user/users.module';
import { CalendarMembersModule } from '../calendar-member/calendar-members.module';
import { EventTasksModule } from '../event-task/event-tasks.module';
import { EventParticipationsModule } from '../event-participation/event-participations.module';
import { EmailModule } from '../email/email.module';
import {APP_INTERCEPTOR} from "@nestjs/core";

@Module({
    imports: [
        TypeOrmModule.forFeature([Event]),
        forwardRef(() => UsersModule),
        forwardRef(() => CalendarMembersModule),
        forwardRef(() => EventTasksModule),
        forwardRef(() => EventParticipationsModule),
        forwardRef(() => EmailModule)
    ],
    controllers: [EventsController],
    providers: [EventsService, EventsRepository,],
    exports: [EventsService, EventsRepository]
})
export class EventsModule {}
