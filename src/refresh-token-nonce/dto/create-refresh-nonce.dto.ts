// src/refresh-token-nonce/dto/create-refresh-nonce.dto.ts
import {
    IsNumber, IsString
} from 'class-validator';

export class CreateRefreshTokenNonceDto {
    @IsNumber()
    userId: number;

    @IsString()
    nonce: string;
}
