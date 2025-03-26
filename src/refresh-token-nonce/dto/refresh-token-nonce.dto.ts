// src/refresh-token-nonce/dto/refresh-token-nonce.dto.ts
import {
    IsString
} from 'class-validator';

export class RefreshTokenNonceDto {
    @IsString()
    nonce: string;
}
