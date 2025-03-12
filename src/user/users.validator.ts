// custom-validators.ts
import {applyDecorators} from '@nestjs/common';
import {
    IsAlpha,
    IsEmail,
    IsOptional,
    IsString, IsStrongPassword, IsUUID,
    Length, Matches, MaxLength,
    MinLength
} from 'class-validator';

/**
 * Декоратор для проверки необязательных имён (firstName, lastName).
 * Проверяет, что значение:
 * - Если указан, то является строкой
 * - Имеет длину от 3 до 100 символов.
 */
export function IsUserName(isOptional: boolean) {
    const decorators = [Matches(/^[a-zA-Z-]+$/), Length(3, 100)];

    if (isOptional) {
        return applyDecorators(IsOptional(), ...decorators);
    } else {
        return applyDecorators(...decorators);
    }
}

/**
 * Декоратор для проверки email.
 * Проверяет, что значение:
 * - Если указано, то является строкой в формате электронной почты.
 */
export function IsUserEmail(isOptional: boolean) {
    const decorators = [IsEmail()];
    if (isOptional) {
        return applyDecorators(IsOptional(), ...decorators);
    } else {
        return applyDecorators(...decorators);
    }
}

/**
 * Декоратор для проверки паролей.
 * Проверяет, что значение:
 * - Если указано, то является строкой
 * - И имеет не менее 6 символов.
 */
export function IsUserPassword(isOptional: boolean) {
    const decorators = [IsStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    }), MaxLength(32)];

    if (isOptional) {
        return applyDecorators(IsOptional(), ...decorators);
    } else {
        return applyDecorators(...decorators);
    }
}

/**
 * Декоратор для проверки имени файла профиля.
 * Проверяет, что значение, если указано, является строкой.
 */
export function IsUserProfilePicture(isOptional: boolean) {
    const decorators = [IsUUID()];
    if (isOptional) {
        return applyDecorators(IsOptional(), ...decorators);
    } else {
        return applyDecorators(...decorators);
    }
}
