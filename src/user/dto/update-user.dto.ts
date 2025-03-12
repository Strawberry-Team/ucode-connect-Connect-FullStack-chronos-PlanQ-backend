import {
    IsUserEmail,
    IsUserName, IsUserPassword, IsUserProfilePicture,
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

    @IsValidCountryCode()
    countryCode?: string;

    @IsUserProfilePicture(true)
    profilePictureName?: string;
}
