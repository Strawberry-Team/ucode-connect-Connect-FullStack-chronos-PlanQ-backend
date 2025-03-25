// src/event/dto/create-event-arrangement.dto.ts
import {CreateEventBaseDto} from './create-event-base.dto';
import {EventType} from '../entity/event.entity';
import {IsIdArray} from '../../common/validators/id.validator';

export class CreateEventArrangementDto extends CreateEventBaseDto {
    @IsIdArray(true)
    participantIds?: number[];

    type = EventType.ARRANGEMENT;
}
