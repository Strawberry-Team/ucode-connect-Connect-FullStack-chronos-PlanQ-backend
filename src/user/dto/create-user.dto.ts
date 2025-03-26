// src/user/dto/create-user.dto.ts
import { IsValidCountryCode } from 'src/country/country.validator';
import { IsUserEmail, IsUserName, IsUserPassword } from "../users.validator";

export class CreateUserDto {
    @IsUserName(false)
    firstName: string;

    @IsUserName(true)
    lastName?: string;

    @IsUserEmail(false)
    email: string;

    @IsUserPassword(false)
    password: string;

    @IsValidCountryCode({ message: 'Invalid country code, must be cca2' }, true)
    countryCode: string;
}
