// src/event/dto/create-event-reminder.dto.ts
import { CreateEventBaseDto } from './create-event-base.dto';
import { EventType } from '../entity/event.entity';

export class CreateEventReminderDto extends CreateEventBaseDto {
    type = EventType.REMINDER;
}
