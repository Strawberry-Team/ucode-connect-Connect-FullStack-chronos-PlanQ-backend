// src/common/dto/offset.pagination.dto.ts
import {IsOffsetPaginationPage, IsOffsetPaginationLimit} from "../validators/offset.pagination.validator";

export class OffsetPaginationDto {
    @IsOffsetPaginationPage(true)
    page: number = 1;

    @IsOffsetPaginationLimit(true)
    limit: number = 10;
}