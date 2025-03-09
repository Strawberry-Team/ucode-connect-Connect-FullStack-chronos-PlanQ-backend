import {
    IsEmail,
    IsString,
    IsNotEmpty,
    Length,
    MinLength,
} from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @Length(3, 30)
    firstName: string;

    @IsString()
    @IsNotEmpty()
    @Length(3, 30)
    lastName: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @IsString()
    @IsNotEmpty()
    @Length(2, 2)
    countryCode: string;
}
