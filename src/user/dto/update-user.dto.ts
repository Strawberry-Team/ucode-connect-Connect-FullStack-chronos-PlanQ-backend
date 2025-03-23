import {
    IsUserEmail,
    IsUserName, IsUserPassword, IsUserProfilePicture, ValidatePasswordUpdate,
} from '../users.validator';

import {IsValidCountryCode} from "../../country/country.validator"

export class UpdateUserDto {
    @IsUserName(true)
    firstName?: string;

    @IsUserName(true)
    lastName?: string;

    @IsUserEmail(true)
    email?: string;

    @IsUserPassword(true)
    oldPassword?: string;

    @IsUserPassword(true)
    newPassword?: string;

    @IsValidCountryCode({message: 'Invalid country code, must be cca2'}, true)
    countryCode?: string;

    @IsUserProfilePicture(true)
    profilePictureName?: string;

    @ValidatePasswordUpdate()
    __dummyField?: never;
}
