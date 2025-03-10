import {
    Injectable,
    BadRequestException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from '../auth/dto/login.dto';
// import { RefreshTokenDto } from './dto/refresh-token.dt';
import { ResetPasswordDto } from '../auth/dto/reset-password.dto';
import { CreateRefreshTokenDto } from './dto/create-refresh-token.dto';
import { RefreshToken } from './entities/refresh-token.entity';

function createToken(){

}

@Injectable()
export class RefreshTokenService {
    async getTokenByUserId(id: number): Promise<RefreshToken> {

    }

    async createToken(createTokenDto: CreateRefreshTokenDto): Promise<RefreshToken>{

    }

    async deleteToken(id: number) : Promise<void>{

    }
}