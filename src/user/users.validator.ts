import {applyDecorators} from '@nestjs/common';
import {
    IsEmail,
    IsOptional,
    IsStrongPassword, IsUUID,
    Length, Matches, MaxLength,
} from 'class-validator';

export function IsUserName(isOptional: boolean) {
    const decorators = [Matches(/^[a-zA-Z-]+$/), Length(3, 100)];

    if (isOptional) {
        return applyDecorators(IsOptional(), ...decorators);
    } else {
        return applyDecorators(...decorators);
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
    const decorators = [IsUUID()];
    if (isOptional) {
        return applyDecorators(IsOptional(), ...decorators);
    } else {
        return applyDecorators(...decorators);
    }
}
