import {
    IsNumber, IsString
} from 'class-validator';

export class CreateRefreshTokenDto {
    @IsNumber()
    userId: number;

    @IsString()
    refreshToken: string;
}
