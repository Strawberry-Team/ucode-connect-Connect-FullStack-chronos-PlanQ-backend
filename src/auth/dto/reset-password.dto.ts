// src/auth/dto/reset-password.dto.ts
import {IsUserEmail} from "../../user/users.validator";

export class ResetPasswordDto {
    @IsUserEmail(false)
    email: string;
}
