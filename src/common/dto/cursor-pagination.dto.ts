// src/common/dto/cursor-pagination.dto.ts
import {IsCursorPaginationAfter, IsCursorPaginationLimit} from "../validators/cursor.pagination.validator";

export class CursorPaginationDto {
    @IsCursorPaginationAfter(true)
    after?: number;

    @IsCursorPaginationLimit(true)
    limit: number = 10;
}