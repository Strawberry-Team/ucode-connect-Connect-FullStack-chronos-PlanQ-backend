// src/refresh-token-nonce/dto/create-refresh-token.dto.ts
import {
    IsNumber, IsString
} from 'class-validator';

export class CreateRefreshTokenDto {
    @IsNumber()
    userId: number;

    @IsString()
    nonce: string;
}
