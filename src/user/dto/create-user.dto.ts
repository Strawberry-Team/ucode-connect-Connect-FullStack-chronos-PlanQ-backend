import { IsValidCountryCode } from 'src/country/country.validator';
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

    @IsValidCountryCode()
    @IsString()
    @IsNotEmpty()
    @Length(2, 2)
    countryCode: string;
}
