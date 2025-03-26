// src/event/events.validator.ts
import {applyDecorators} from '@nestjs/common';
import {IsEnum, IsOptional} from 'class-validator';
import {EventCategory, EventType} from "./entity/event.entity";
import {TaskPriority} from "../event-task/entity/event-task.entity";

export function IsEventCategory(isOptional: boolean) {
    const decorators = [IsEnum(EventCategory)];

    if (isOptional) {
        return applyDecorators(IsOptional(), ...decorators);
    } else {
        return applyDecorators(...decorators);
    }
}

export function IsEventType(isOptional: boolean) {
    const decorators = [IsEnum(EventType)];

    if (isOptional) {
        return applyDecorators(IsOptional(), ...decorators);
    } else {
        return applyDecorators(...decorators);
    }
}

export function IsEventTaskPriority(isOptional: boolean) {
    const decorators = [IsEnum(TaskPriority)];

    if (isOptional) {
        return applyDecorators(IsOptional(), ...decorators);
    } else {
        return applyDecorators(...decorators);
    }
}

import {registerDecorator, ValidationOptions, ValidationArguments} from 'class-validator';

export function ValidateDatePair(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'validateDatePair',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if (!value || typeof value !== 'object') return true;

                    const hasStartDate = value.startedAt !== undefined;
                    const hasEndDate = value.endedAt !== undefined;

                    if (hasStartDate !== hasEndDate) {
                        return false;
                    }

                    return true;
                },
                defaultMessage(args: ValidationArguments) {
                    return 'Both startedAt and endedAt must be provided together';
                }
            }
        });
    };
}