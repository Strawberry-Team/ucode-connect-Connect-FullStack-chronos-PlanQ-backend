import {
    IsNumber, IsString, IsDate
} from 'class-validator';

export class CreateRefreshTokenDto {
    @IsNumber()
    userId: number;

    @IsString()
    token: string;
}
