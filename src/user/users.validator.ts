import {applyDecorators} from '@nestjs/common';
import {
    Allow,
    IsEmail,
    IsOptional,
    IsStrongPassword, IsUUID,
    Length, Matches, MaxLength, ValidateIf,
} from 'class-validator';

export function IsUserName(isOptional: boolean, allowNull: boolean = false) {
    const baseDecorators = [Matches(/^[a-zA-Z-]+$/), Length(3, 100)];

    if (allowNull) {
        // Если разрешаем null, используем IsOptional() и добавляем проверку на null
        return applyDecorators(
            ValidateIf(value => value !== null),
            ...baseDecorators,
            IsOptional()
        );
    } else if (isOptional) {
        // Если просто опционально (но не null)
        return applyDecorators(IsOptional(), ...baseDecorators);
    } else {
        // Если обязательное и не null
        return applyDecorators(...baseDecorators);
    }
}

export function IsUserEmail(isOptional: boolean) {
    const decorators = [IsEmail()];
    if (isOptional) {
        return applyDecorators(IsOptional(), ...decorators);
    } else {
        return applyDecorators(...decorators);
    }
}

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

export function IsUserProfilePicture(isOptional: boolean) { //TODO: типы для файлов вынести в .env(и еще где-то эти типы встречаются)
    const uuidWithExtensionPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|jpeg|png)$/i;

    const decorators = [Matches(uuidWithExtensionPattern, {
        message: 'Profile picture must be in format {uuid}.jpg, {uuid}.jpeg, or {uuid}.png'
    })];

    if (isOptional) {
        return applyDecorators(IsOptional(), ...decorators);
    } else {
        return applyDecorators(...decorators);
    }
}
