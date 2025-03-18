// src/calendars/validators/calendars.validator.ts
import {applyDecorators} from '@nestjs/common';
import {IsEnum, IsOptional, IsString, Length, Matches, MaxLength, registerDecorator, ValidateIf} from 'class-validator';
import {CalendarRole} from "../user-calendar/entity/user-calendar.entity";

export function IsCalendarName(isOptional: boolean) {
    const decorators = [IsString(), Length(3, 100)];

    if (isOptional) {
        return applyDecorators(IsOptional(), ...decorators);
    } else {
        return applyDecorators(...decorators);
    }
}

export function IsCalendarDescription(isOptional: boolean, allowNull: boolean = false) {
    const decorators = [IsString(), MaxLength(255)];

    if (allowNull) {
        return applyDecorators(
            ValidateIf(value => value !== null),
            ...decorators,
            IsOptional()
        );
    } else if (isOptional) {
        return applyDecorators(IsOptional(), ...decorators);
    } else {
        return applyDecorators(...decorators);
    }
}

export function IsCalendarColor(isOptional: boolean) {
    const decorators = [
        IsString(),
        Matches(/^#[0-9A-Fa-f]{6}$/, {
            message: 'Color must be a valid hex color code (e.g., #FF5733)'
        })
    ];

    if (isOptional) {
        return applyDecorators(IsOptional(), ...decorators);
    } else {
        return applyDecorators(...decorators);
    }
}

// export function IsCalendarRole(isOptional: boolean) {
//     const decorators = [IsEnum(CalendarRole, {
//         message: 'Role must be either editor or viewer'
//     })];
//
//     if (isOptional) {
//         return applyDecorators(IsOptional(), ...decorators);
//     } else {
//         return applyDecorators(...decorators);
//     }
// }
/**
 * Декоратор для валидации ролей календаря
 * @param isOptional - является ли поле необязательным
 */
export function IsCalendarRole(isOptional: boolean) {
    const decorators = [IsEnum(CalendarRole)];

    if (isOptional) {
        return applyDecorators(IsOptional(), ...decorators);
    } else {
        return applyDecorators(...decorators);
    }
}