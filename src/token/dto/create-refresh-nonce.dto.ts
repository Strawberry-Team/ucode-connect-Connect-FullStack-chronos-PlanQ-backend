import {
    IsNumber, IsString
} from 'class-validator';

export class CreateRefreshTokenNonceDto {
    @IsNumber()
    userId: number;

    @IsString()
    nonce: string;
}
