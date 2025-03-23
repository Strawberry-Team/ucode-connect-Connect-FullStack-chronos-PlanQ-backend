import {applyDecorators} from '@nestjs/common';
import {IsEnum, IsISO8601, IsOptional} from 'class-validator';
import {EventCategory} from "./entity/event.entity";
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
    const decorators = [IsEnum(EventCategory)];

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

import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function ValidateDatePair(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'validateDatePair',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    // If the value is not an object, we can't validate further
                    if (!value || typeof value !== 'object') return true;

                    const hasStartDate = value.startedAt !== undefined;
                    const hasEndDate = value.endedAt !== undefined;

                    // If one is defined, both must be defined
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