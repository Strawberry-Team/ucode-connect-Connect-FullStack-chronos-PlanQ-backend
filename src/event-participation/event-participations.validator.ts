// src/event-participation/event-participations.validator.ts
import {IsEnum, IsOptional} from "class-validator";
import {ResponseStatus} from "./entity/event-participation.entity";
import {applyDecorators} from "@nestjs/common";

export function IsEventParticipationResponseStatus(isOptional: boolean) {
    const decorators = [IsEnum(ResponseStatus)];

    if (isOptional) {
        return applyDecorators(IsOptional(), ...decorators);
    } else {
        return applyDecorators(...decorators);
    }
}