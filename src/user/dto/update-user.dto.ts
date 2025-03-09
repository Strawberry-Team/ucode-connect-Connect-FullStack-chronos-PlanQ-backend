import {
    IsEmail,
    IsOptional,
    IsString,
    MinLength,
    Length,
} from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @Length(3, 100)
    firstName?: string;

    @IsOptional()
    @IsString()
    @Length(3, 100)
    lastName?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    // Если требуется изменить пароль – оба поля обязательны
    @IsOptional()
    @IsString()
    @MinLength(6)
    oldPassword?: string; //TODO проверять пароль на ...

    @IsOptional()
    @IsString()
    @MinLength(6)
    newPassword?: string; //TODO проверять пароль на ...

    @IsOptional()
    @IsString()
    countryCode?: string; //TODO понять какие можно, и проверять

    @IsOptional()
    @IsString()
    profilePictureName?: string;
}
