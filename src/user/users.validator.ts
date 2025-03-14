import {applyDecorators} from '@nestjs/common';
import {
    IsEmail,
    IsOptional,
    IsStrongPassword,
    Length, Matches, MaxLength, ValidateIf,
} from 'class-validator';
import {AvatarConfig} from '../config/avatar.config';

export function IsUserName(isOptional: boolean, allowNull: boolean = false) {
    const baseDecorators = [Matches(/^[a-zA-Z-]+$/), Length(3, 100)];

    if (allowNull) {
        return applyDecorators(
            ValidateIf(value => value !== null),
            ...baseDecorators,
            IsOptional()
        );
    } else if (isOptional) {
        return applyDecorators(IsOptional(), ...baseDecorators);
    } else {
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

export function IsUserProfilePicture(isOptional: boolean) {
    const uuidWithExtensionPattern = new RegExp(`^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\\.(${AvatarConfig.prototype.allowedTypes})$`, 'i');

    const decorators = [Matches(uuidWithExtensionPattern, {
        message: 'Profile picture must be in format {uuid}.jpg|jpeg|png'
    })];

    if (isOptional) {
        return applyDecorators(IsOptional(), ...decorators);
    } else {
        return applyDecorators(...decorators);
    }
}
