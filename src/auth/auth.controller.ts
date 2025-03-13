import {Body, Controller, Post, UseGuards, Request, UsePipes, ValidationPipe, HttpCode} from '@nestjs/common';
import {AuthService} from './auth.service';
import {CreateUserDto} from '../user/dto/create-user.dto';
import {LoginDto} from './dto/login.dto';
import {ResetPasswordDto} from './dto/reset-password.dto';
import {RefreshTokenDto} from '../token/dto/refresh-token.dto';
import {newPasswordDto} from './dto/new-password.dto'
import {JwtRefreshGuard, JwtResetPasswordGuard, JwtConfirmEmailGuard} from './guards/auth.jwt-guards';
import {Request as ExpressRequest} from 'express';

interface RequestWithUser extends ExpressRequest {
    user: {
        userId: number;
    };
}

@Controller('auth')
@UsePipes(new ValidationPipe({whitelist: true}))
export class AuthController {
    constructor(private readonly authService: AuthService) {
    }

    @Post('register')
    async register(@Body() createUserDto: CreateUserDto) {
        return this.authService.register(createUserDto);
    }

    //TODO: add email verification guard by boolean field
    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @HttpCode(204)
    @UseGuards(JwtRefreshGuard)
    @Post('logout')
    async logout(@Request() req: RequestWithUser, @Body() refreshToken: RefreshTokenDto) {
        return this.authService.logout(req.user.userId, refreshToken);
    }

    @UseGuards(JwtRefreshGuard)
    @Post('/access-token/refresh')
    async refreshToken(@Request() req: RequestWithUser) {
        return this.authService.refreshToken(req.user.userId);
    }

    @UseGuards(JwtResetPasswordGuard)
    @Post('reset-password/:confirm_token') //TODO: add guard for 1 time use(redis)
    async resetPasswordWithConfirmToken(@Body() newPasswordDto: newPasswordDto, @Request() req: RequestWithUser) {
        return this.authService.resetPasswordWithConfirmToken(newPasswordDto, req.user.userId);
    }

    //TODO: add email verification guard. 1 time use
    @UseGuards(JwtConfirmEmailGuard)
    @Post('confirm-email/:confirm_token')
    async verifyEmailWithConfirmToken(@Request() req: RequestWithUser) {
        return this.authService.confirmEmail(req.user.userId);
    }

    @Post('reset-password')
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto);
    }
}
