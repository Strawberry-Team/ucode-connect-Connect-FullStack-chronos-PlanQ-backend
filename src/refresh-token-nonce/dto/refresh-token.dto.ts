// src/refresh-token-nonce/dto/refresh-token.dto.ts
import {
    IsString
} from 'class-validator';

export class RefreshTokenDto {
    @IsString()
    token: string;
}
