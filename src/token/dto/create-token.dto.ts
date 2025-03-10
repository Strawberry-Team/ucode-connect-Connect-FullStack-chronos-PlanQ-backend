import {
    IsNumber, IsString, IsDate
} from 'class-validator';

export class CreateTokenDto {
    @IsNumber()
    userId: number;

    @IsString()
    token: string;
}
