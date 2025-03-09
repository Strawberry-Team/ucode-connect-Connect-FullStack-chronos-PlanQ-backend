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
    @Length(3, 30)
    firstName?: string;

    @IsOptional()
    @IsString()
    @Length(3, 30)
    lastName?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    // Если требуется изменить пароль – оба поля обязательны
    @IsOptional()
    @IsString()
    @MinLength(6)
    oldPassword?: string;

    @IsOptional()
    @IsString()
    @MinLength(6)
    newPassword?: string;

    @IsOptional()
    @IsString()
    countryCode?: string;

    @IsOptional()
    @IsString()
    profilePictureName?: string;
}
