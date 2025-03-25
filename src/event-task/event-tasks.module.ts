// src/event-task/event-tasks.module.ts
import {Module, forwardRef} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {EventTasksService} from './event-tasks.service';
import {EventTasksRepository} from './event-tasks.repository';
import {EventTask} from './entity/event-task.entity';
import {EventsModule} from '../event/events.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([EventTask]),
        forwardRef(() => EventsModule)
    ],
    providers: [EventTasksService, EventTasksRepository],
    exports: [EventTasksService, EventTasksRepository]
})
export class EventTasksModule {
}
