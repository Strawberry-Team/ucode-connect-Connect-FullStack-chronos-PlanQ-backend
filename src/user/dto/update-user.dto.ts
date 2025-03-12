import {
    IsUserEmail,
    IsUserName, IsUserPassword, IsUserProfilePicture,

} from '../users.validator';

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

    countryCode?: string; //TODO: add validation

    @IsUserProfilePicture(true)
    profilePictureName?: string;
}
