import {IsUserEmail} from "../../user/users.validator";

export class ResetPasswordDto {
    @IsUserEmail(false)
    email: string;
}
