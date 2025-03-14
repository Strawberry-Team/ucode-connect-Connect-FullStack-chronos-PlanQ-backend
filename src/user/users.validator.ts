import {applyDecorators} from '@nestjs/common';
import {
    IsEmail,
    IsOptional,
    IsStrongPassword, IsUUID,
    Length, Matches, MaxLength,
} from 'class-validator';
import { AvararConfig } from '../config/avarar.config';

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
    const uuidWithExtensionPattern = new RegExp(`^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\\.(${AvararConfig.prototype.alowedTypes})$`,'i');
    console.log(AvararConfig.prototype.alowedTypes);

    const decorators = [Matches(uuidWithExtensionPattern, {
        message: 'Profile picture must be in format {uuid}.jpg|jpeg|png'
    })];

    if (isOptional) {  
        return applyDecorators(IsOptional(), ...decorators);
    } else {
        return applyDecorators(...decorators);
    }
}
