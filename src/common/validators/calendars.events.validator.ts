import {applyDecorators} from '@nestjs/common';
import {IsOptional, IsString, Length, Matches, MaxLength, ValidateIf} from 'class-validator';

export function IsCalendarAndEventName(isOptional: boolean) {
    const decorators = [IsString(), Length(3, 100)];
    if (isOptional) {
        return applyDecorators(IsOptional(), ...decorators);
    } else {
        return applyDecorators(...decorators);
    }
}

export function IsCalendarAndEventDescription(isOptional: boolean, allowNull: boolean = false) {
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

export function IsCalendarAndEventColor(isOptional: boolean) {
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