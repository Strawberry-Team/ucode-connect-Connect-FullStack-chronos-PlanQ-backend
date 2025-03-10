import {
    Injectable,
    BadRequestException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from '../auth/dto/login.dto';
// import { RefreshTokenDto } from '../token/dto/refresh-token.dto';
import { ResetPasswordDto } from '../auth/dto/reset-password.dto';
import { CreateRefreshTokenDto } from '../token/dto/create-refresh-token.dto';

@Injectable()
export class AuthService {
    async register(createUserDto: CreateUserDto){

    }

    async login(loginDto: LoginDto){

    }

    async refreshToken(refreshTokenDto: RefreshTokenDto){

    }

    async resetPassword(ResetPasswordDto: ResetPasswordDto){

    }
}