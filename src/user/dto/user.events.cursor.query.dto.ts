// src/users/dto/get-user-events-cursor-query.dto.ts
import { CursorPaginationDto } from '../../common/dto/cursor.pagination.dto';
import { IsQueryUserEventsName } from '../users.query.validator';
import { CursorType } from "../../common/types/cursor.pagination.types";
import { IsCursorType } from "../../common/validators/cursor.pagination.validator";

export class GetUserEventsCursorQueryDto extends CursorPaginationDto {
    @IsQueryUserEventsName(false)
    name: string;

    @IsCursorType(false)
    type: CursorType = CursorType.EVENT;
}