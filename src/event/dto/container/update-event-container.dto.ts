// src/event/dto/update-event-container.dto.ts
import {IsEnum, IsOptional, ValidateNested} from 'class-validator';
import {EventType} from '../../entity/event.entity';
import {UpdateEventDto} from '../update-event.dto';
import {UpdateEventTaskDto} from '../update-event-task.dto';
import {Type} from 'class-transformer';
import {IsEventType} from "../../events.validator";

export class UpdateEventContainerDto {
    @IsEventType(false)
    type: EventType;

    @ValidateNested() //TODO: проверить Валидируем вложенный объект
    @Type((options) => {
        // Безопасно проверяем наличие объекта и свойства type
        if (options?.object && 'type' in options.object) {
            if (options.object.type === EventType.TASK) {
                return UpdateEventTaskDto;
            }
            // В будущем можно добавить другие типы обновлений, например:
            // if (options.object.type === EventType.ARRANGEMENT) return UpdateEventArrangementDto;
            // if (options.object.type === EventType.REMINDER) return UpdateEventReminderDto;
        }
        return UpdateEventDto;
    })
    data: UpdateEventDto;

    // @Exclude()
    // @Transform(({ value }) => {
    //     // Этот метод не будет вызван напрямую, он здесь для справки
    //     return {...value, type: value.type};
    // })
    // flattened: any;
}