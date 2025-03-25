import { applyDecorators } from '@nestjs/common';
import {IsInt, IsOptional, Min, Max, IsArray, IsPositive} from 'class-validator';

export function IsOffsetPaginationPage(isOptional: boolean) {
    const decorators = [IsInt(), IsPositive()];
    if (isOptional) {
        return applyDecorators(IsOptional(), ...decorators);
    }
    return applyDecorators(...decorators);
}

export function IsOffsetPaginationLimit(isOptional: boolean, maxLimit: number = 100) {
    const decorators = [IsInt(), IsPositive(), Max(maxLimit, { message: `Limit must not exceed ${maxLimit}` }),];
    if (isOptional) {
        return applyDecorators(IsOptional(), ...decorators);
    }
    return applyDecorators(...decorators);
}