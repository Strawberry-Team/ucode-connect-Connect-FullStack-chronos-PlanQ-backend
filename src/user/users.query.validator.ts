import {IsOptional, IsString, Length} from "class-validator";
import {applyDecorators} from "@nestjs/common";

export function IsQueryUserEventsName(isOptional: boolean) {
    const decorators = [
        IsString(),
        Length(3, 100),
    ];
    if (isOptional) {
        return applyDecorators(IsOptional(), ...decorators);
    }
    return applyDecorators(...decorators);
}