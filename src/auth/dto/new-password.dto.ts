import {
    IsStrongPassword
} from 'class-validator';

export class newPasswordDto {
    @IsStrongPassword()
    newPassword: string;
}
