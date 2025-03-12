import {
    IsUserEmail,
    IsUserName, IsUserPassword, IsUserProfilePicture,

} from '../users.validator';

import { IsValidCountryCode } from "../../country/country.validator"

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
    @IsOptional()
    @IsString()
    countryCode?: string; //TODO понять какие можно, и проверять

    @IsUserProfilePicture(true)
    profilePictureName?: string;
}
