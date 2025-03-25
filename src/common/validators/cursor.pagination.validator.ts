// src/common/dto/cursor-pagination.dto.ts
import {IsInt, IsOptional, Min, Max, IsPositive} from 'class-validator';
import { applyDecorators } from '@nestjs/common';
import {IsId} from "./id.validator";

export function IsCursorPaginationAfter(isOptional: boolean) {
    return IsId(isOptional);
}

export function IsCursorPaginationLimit(isOptional: boolean, maxLimit = 100) {
    const decorators = [IsInt(), IsPositive(), Max(maxLimit, { message: `Limit must not exceed ${maxLimit}` }),];
    if (isOptional) {
        return applyDecorators(IsOptional(), ...decorators);
    }
    return applyDecorators(...decorators);
}