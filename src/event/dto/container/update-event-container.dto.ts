// src/event/dto/update-event-container.dto.ts
import {ValidateNested} from 'class-validator';
import {EventType} from '../../entity/event.entity';
import {UpdateEventDto} from '../update-event.dto';
import {UpdateEventTaskDto} from '../update-event-task.dto';
import {Type} from 'class-transformer';
import {IsEventType} from "../../events.validator";

export class UpdateEventContainerDto {
    @IsEventType(false)
    type: EventType;

    @ValidateNested()
    @Type((options) => {
        if (options?.object && 'type' in options.object) {
            if (options.object.type === EventType.TASK) {
                return UpdateEventTaskDto;
            }
            // Other types of updates can be added in the future, such as:
            // if (options.object.type === EventType.ARRANGEMENT) return UpdateEventArrangementDto;
            // if (options.object.type === EventType.REMINDER) return UpdateEventReminderDto;
        }
        return UpdateEventDto;
    })
    data: UpdateEventDto;

    // @Exclude()
    // @Transform(({ value }) => {
    //     // This method will not be called directly, it is here for reference
    //     return {...value, type: value.type};
    // })
    // flattened: any;
}