import {
    IsEmail,
    IsString,
    IsNotEmpty,
    Length,
    MinLength,
} from 'class-validator';

export class CreateUserDto //TODO: написать один user.dto, базовый
 {
    @IsString()
    @IsNotEmpty()
    @Length(3, 100)
    firstName: string;

    @IsString()
    @IsNotEmpty()
    @Length(3, 100)
    lastName: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string; //TODO: проверять пароль на ...

    @IsString()
    @IsNotEmpty()
    @Length(2, 2)
    countryCode: string; //TODO: понять какие можно, и проверять
}
