import { applyDecorators } from "@nestjs/common";
import {IsArray, IsInt, IsOptional, IsPositive} from "class-validator";


export function IsId(isOptional: boolean) {
    const decorators = [IsInt(), IsPositive()];
    if (isOptional) {
        return applyDecorators(IsOptional(), ...decorators);
    } else {
        return applyDecorators(...decorators);
    }
}

export function IsIdArray(isOptional: boolean) {
    const decorators = [IsArray(), IsInt({each: true}), IsPositive({each: true})];
    if (isOptional) {
        return applyDecorators(IsOptional(), ...decorators);
    } else {
        return applyDecorators(...decorators);
    }
}