import {IsUserEmail, IsUserName, IsUserPassword} from "../users.validator";

export class CreateUserDto {
    @IsUserName(false)
    firstName: string;

    @IsUserName(true)
    lastName?: string;

    @IsUserEmail(false)
    email: string;

    @IsUserPassword(false)
    password: string;

    countryCode: string; //TODO: add validation
}
