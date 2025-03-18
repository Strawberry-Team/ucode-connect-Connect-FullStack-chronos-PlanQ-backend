import {
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import {CreateUserDto} from '../user/dto/create-user.dto';
import {LoginDto} from '../auth/dto/login.dto';
import {RefreshTokenDto} from '../token/dto/refresh-token.dto';
import {ResetPasswordDto} from '../auth/dto/reset-password.dto';
import {CreateRefreshTokenDto} from '../token/dto/create-refresh-token.dto';
import {newPasswordDto} from './dto/new-password.dto';
import {UsersService} from 'src/user/users.service';
import {RefreshTokenService} from 'src/token/refresh-token.service';
import {JwtUtils} from '../jwt/jwt-token.utils';
import {PasswordService} from "../user/passwords.service";
import {convertToSeconds} from "../common/utils/time.utils";
import { EmailService } from 'src/email/email.service';


@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly refreshTokenService: RefreshTokenService,
        private readonly jwtUtils: JwtUtils,
        private readonly passwordService: PasswordService,
        private readonly emailService: EmailService
    ) {
    }


    async register(createUserDto: CreateUserDto) {
        const user = await this.usersService.createUser(createUserDto);

        const result = this.jwtUtils.generateToken({sub: user.id}, 'confirmEmail');
        //TODO: send email with link
        const link = 'localhost:3000/api/auth/confirm-email/' + result;
        await this.emailService.sendConfirmationEmail(user.email, link);

        return {user: user, confirmEmailLink: link};
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

        const accessToken = this.jwtUtils.generateToken({sub: user.id}, 'access');
        const refreshToken = this.jwtUtils.generateToken({sub: user.id}, 'refresh');

        await this.refreshTokenService.createToken({
            userId: user.id,
            refreshToken: refreshToken,
        } as CreateRefreshTokenDto);

        delete user.emailVerified;

        const {password, ...userWithoutPass} = user;
        return {user: userWithoutPass, accessToken, refreshToken};
    }

    async logout(userId: number, refreshTokenDto: RefreshTokenDto) {
        const tokenEntity = await this.refreshTokenService.getTokenByTokenAndUserId(
            userId,
            refreshTokenDto.refreshToken,
        );
        if (!tokenEntity) {
            throw new NotFoundException(
                `Refresh token for user id ${userId} not found`,
            );
        }

        await this.refreshTokenService.deleteTokenByTokenId(tokenEntity.id);
        return {message: 'Logged out successfully'};
    }

    async refreshToken(userId: number, expiresIn: number, createdAt: number, refreshTokenDto: RefreshTokenDto) {
        const accessToken = this.jwtUtils.generateToken({sub: userId}, 'access');
        const time: number = new Date().getTime() / 1000;
        if (time - createdAt > convertToSeconds("1d")) {
            const newRefreshToken = this.jwtUtils.generateToken({sub: userId}, 'refresh');
            await this.refreshTokenService.createToken({
                userId: userId,
                refreshToken: newRefreshToken,
            } as CreateRefreshTokenDto);
            const tokenId: number = await this.refreshTokenService.getTokenByTokenAndUserId(userId, refreshTokenDto.refreshToken).then(token => token.id);
            await this.refreshTokenService.deleteTokenByTokenId(tokenId);
            return {accessToken, newRefreshToken};
        }

        return {accessToken};
    }

    async resetPasswordWithConfirmToken(newPasswordDto: newPasswordDto, userId: number) {
        await this.usersService.updatePassword(userId, newPasswordDto.newPassword);
        await this.refreshTokenService.deleteTokensByUserID(userId);
        return {message: 'Password has been reset successfully'};
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto) {
        const user = await this.usersService.getUserByEmail(resetPasswordDto.email);

        if (!user) {
            throw new NotFoundException('User with this email not found');
        }

        const passwordResetToken = this.jwtUtils.generateToken({sub: user.id}, 'resetPassword');
        const link = 'localhost:3000/api/auth/reset-password/' + passwordResetToken;
        //TODO: send email with link
        return {passwordResetLink: link}
    }

    async confirmEmail(userId: number) {
        const user = await this.usersService.confirmEmail(userId);
        return {message: 'Email confirmed successfully'};
    }
}