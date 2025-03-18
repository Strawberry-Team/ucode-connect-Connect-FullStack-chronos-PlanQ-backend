import {
    IsString
} from 'class-validator';

export class RefreshTokenNonceDto {
    @IsString()
    nonce: string;
}
