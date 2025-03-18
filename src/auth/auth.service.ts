import {
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import {CreateUserDto} from '../user/dto/create-user.dto';
import {LoginDto} from '../auth/dto/login.dto';
import {RefreshTokenNonceDto} from '../token/dto/refresh-token-nonce.dto';
import {ResetPasswordDto} from '../auth/dto/reset-password.dto';
import {CreateRefreshTokenNonceDto} from '../token/dto/create-refresh-nonce.dto';
import {newPasswordDto} from './dto/new-password.dto';
import {UsersService} from 'src/user/users.service';
import {RefreshTokenNonceService} from 'src/token/refresh-token-nonce.service';
import {JwtUtils} from '../jwt/jwt-token.utils';
import {PasswordService} from "../user/passwords.service";
import {convertToSeconds} from "../common/utils/time.utils";
import { EmailService } from 'src/email/email.service';
import {ConfigService} from '@nestjs/config';
import { NonceUtils } from 'src/common/utils/nonce.utils';
import { RefreshTokenDto } from '../token/dto/refresh-token.dto';


@Injectable()
export class AuthService {

    private frontUrl: string;

    constructor(
        private readonly usersService: UsersService,
        private readonly refreshTokenNonceService: RefreshTokenNonceService,
        private readonly jwtUtils: JwtUtils,
        private readonly passwordService: PasswordService,
        private readonly emailService: EmailService,
        private readonly configService: ConfigService,
        private readonly nonceUtils: NonceUtils
    ) {
        this.frontUrl = String(this.configService.get<string>('app.frontendLink'));
    }


    async register(createUserDto: CreateUserDto) {
        const user = await this.usersService.createUser(createUserDto);

        const result = this.jwtUtils.generateToken({sub: user.id}, 'confirmEmail');
        const link = this.frontUrl + 'auth/confirm-email/' + result;
        console.log("linkConfirmationEmail: ", link);
        this.emailService.sendConfirmationEmail(user.email, link); 

        return {user: user};
    }


    async login(loginDto: LoginDto) {
        const user = await this.usersService.getUserByEmail(loginDto.email);
    
        const passwordValid = await this.passwordService.compare(loginDto.password, String(user.password));

        if (!passwordValid) {
            throw new UnauthorizedException('Invalid password');
        }

        if (!Boolean(user.emailVerified?.[0])) {
            throw new ForbiddenException('Please verify your email.');
        }

        const newNonce = this.nonceUtils.generateNonce();

        const accessToken = this.jwtUtils.generateToken({sub: user.id}, 'access');
        const refreshToken = this.jwtUtils.generateToken({sub: user.id, nonce: newNonce}, 'refresh');
        
        await this.refreshTokenNonceService.createRefreshTokenNonce({
            userId: user.id,
            nonce: newNonce,
        } as CreateRefreshTokenNonceDto);

        delete user.emailVerified;

        const {password, ...userWithoutPass} = user;
        return {user: userWithoutPass, accessToken, refreshToken};
    }

    async logout(userId: number, refreshNonceDto: string) {
        const nonceEntity = await this.refreshTokenNonceService.getRefreshTokenNonceByNonceAndUserId(
            userId,
            refreshNonceDto,
        );
        if (!nonceEntity) {
            throw new NotFoundException(
                `Refresh token for user id ${userId} not found`,
            );
        }

        await this.refreshTokenNonceService.deleteRefreshTokenNonceByNonceId(nonceEntity.id);
        return {message: 'Logged out successfully'};
    }

    async refreshToken(userId: number, createdAt: number, refreshNonce: string) {
        const accessToken = this.jwtUtils.generateToken({sub: userId}, 'access');
        const time: number = new Date().getTime() / 1000;
        
        if (time - createdAt > convertToSeconds("1d")) {
            
            const newNonce = this.nonceUtils.generateNonce();
            const newRefreshToken = this.jwtUtils.generateToken({sub: userId, nonce: newNonce}, 'refresh'); 
            
            await this.refreshTokenNonceService.createRefreshTokenNonce({
                userId: userId,
                nonce: newNonce,
            } as CreateRefreshTokenNonceDto);

            const nonceId: number = await this.refreshTokenNonceService.getRefreshTokenNonceByNonceAndUserId(userId, refreshNonce).then(nonce => nonce.id);
            await this.refreshTokenNonceService.deleteRefreshTokenNonceByNonceId(nonceId);
            return {accessToken, newRefreshToken};
        }

        return {accessToken};
    }

    async resetPasswordWithConfirmToken(newPasswordDto: newPasswordDto, userId: number) {
        await this.usersService.updatePassword(userId, newPasswordDto.newPassword);
        await this.refreshTokenNonceService.deleteRefreshTokenNoncesByUserId(userId);
        return {message: 'Password has been reset successfully'};
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto) {
        const user = await this.usersService.getUserByEmail(resetPasswordDto.email);

        if (!user) {
            throw new NotFoundException('User with this email not found');
        }

        const passwordResetToken = this.jwtUtils.generateToken({sub: user.id}, 'resetPassword');
        
        const link = this.frontUrl + "auth/reset-password/" + passwordResetToken; //localhost:5173/auth/reset-password/passwordResetToken

        console.log("link", link)

        this.emailService.sendResetPasswordEmail(user.email, link)
    }

    async confirmEmail(userId: number) {
        const user = await this.usersService.confirmEmail(userId);
        return {message: 'Email confirmed successfully'};
    }
}