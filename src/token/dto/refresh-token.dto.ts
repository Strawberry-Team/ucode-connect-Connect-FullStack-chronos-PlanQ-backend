import { IsJWT, IsNotEmpty, IsNumber } from 'class-validator';

export class RefreshTokenDto {
    @IsNumber()
    userId: number;

    @IsJWT()
    @IsNotEmpty()
    refreshToken: string;
}
