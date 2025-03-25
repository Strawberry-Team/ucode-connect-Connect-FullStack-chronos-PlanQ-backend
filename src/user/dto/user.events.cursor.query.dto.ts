// src/users/dto/get-user-events-cursor-query.dto.ts
import { CursorPaginationDto } from '../../common/dto/cursor-pagination.dto';
import { IsQueryUserEventsName } from '../users.query.validator';

export class GetUserEventsCursorQueryDto extends CursorPaginationDto {
    @IsQueryUserEventsName(false)
    name: string;
}