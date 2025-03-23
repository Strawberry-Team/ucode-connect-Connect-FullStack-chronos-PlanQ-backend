// src/event/dto/update-event-task.dto.ts
import { UpdateEventDto } from './update-event.dto';
import { TaskPriority } from '../../event-task/entity/event-task.entity';
import {IsEventTaskPriority} from "../events.validator";
import {IsBooleanField} from "../../common/validators/is-boolean-field.validator";

export class UpdateEventTaskDto extends UpdateEventDto {
    @IsEventTaskPriority(true)
    priority?: TaskPriority;

    @IsBooleanField(true)
    isCompleted?: boolean;
}
