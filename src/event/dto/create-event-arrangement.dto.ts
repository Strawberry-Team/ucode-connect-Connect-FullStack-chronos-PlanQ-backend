// src/event/dto/create-event-arrangement.dto.ts
import { IsArray, IsOptional } from 'class-validator';
import { CreateEventBaseDto } from './create-event.dto';
import { EventType } from '../entity/event.entity';
import { IsIdArray } from '../../common/validators/id.validator';

export class CreateEventArrangementDto extends CreateEventBaseDto {
    @IsIdArray(true)
    participantIds?: number[];

    type = EventType.ARRANGEMENT;
}
