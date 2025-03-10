import {
    Injectable,
    BadRequestException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from '../auth/dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResetPasswordDto } from '../auth/dto/reset-password.dto';
import { CreateTokenDto } from './dto/create-token.dto';

function createToken(){

}

@Injectable()
export class TokenService {
    async refreshToken(refreshTokenDto: RefreshTokenDto){

    }

    async getTokenById(id: number){

    }

    async createToken(createTokenDto: CreateTokenDto){

    }

    async deleteToken(ResetPasswordDto: ResetPasswordDto){

    }
}