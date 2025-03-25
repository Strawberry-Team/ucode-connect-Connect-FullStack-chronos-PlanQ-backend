// src/event/dto/create-event-container.dto.ts
import {ValidateNested} from 'class-validator';
import {EventType} from '../../entity/event.entity';
import {CreateEventBaseDto} from '../create-event-base.dto';
import {CreateEventTaskDto} from '../create-event-task.dto';
import {CreateEventArrangementDto} from '../create-event-arrangement.dto';
import {CreateEventReminderDto} from '../create-event-reminder.dto';
import {Expose, Transform, Type} from 'class-transformer';
import {IsEventType} from "../../events.validator"; // Импортируем Type отсюда

export class CreateEventContainerDto {
    @IsEventType(false)
    type: EventType;

    @ValidateNested()
    @Type(options => {
        if (options?.object && 'type' in options.object) {
            switch (options.object.type) {
                case EventType.TASK:
                    return CreateEventTaskDto;
                case EventType.ARRANGEMENT:
                    return CreateEventArrangementDto;
                case EventType.REMINDER:
                    return CreateEventReminderDto;
                default:
                    return CreateEventBaseDto;
            }
        }
        return CreateEventBaseDto;
    })
    data: CreateEventBaseDto; // Это может быть один из наследников CreateEventBaseDto

    // Метод для преобразования объекта в плоскую структуру
    // @Transform(({ value }) => {
    //     if (!value || !value.data || !value.type) return undefined;
    //     return { ...value.data, type: value.type };
    // })
    // flattened: any;    
}