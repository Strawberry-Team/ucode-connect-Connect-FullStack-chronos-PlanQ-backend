// src/event/dto/create-event-task.dto.ts
import {CreateEventBaseDto} from './create-event-base.dto';
import {TaskPriority} from '../../event-task/entity/event-task.entity';
import {EventType} from '../entity/event.entity';
import {IsEventTaskPriority} from "../events.validator";

export class CreateEventTaskDto extends CreateEventBaseDto {
    @IsEventTaskPriority(true)
    priority: TaskPriority;

    type = EventType.TASK;
}
