// src/auth/auth.controller.ts
import {Body, Controller, Post, UseGuards, Request, UsePipes, ValidationPipe, HttpCode, Get, Req} from '@nestjs/common';
import {AuthService} from './auth.service';
import {CreateUserDto} from '../user/dto/create-user.dto';
import {LoginDto} from './dto/login.dto';
import {ResetPasswordDto} from './dto/reset-password.dto';
import {newPasswordDto} from './dto/new-password.dto'
import {JwtRefreshGuard, JwtResetPasswordGuard, JwtConfirmEmailGuard, JwtAuthGuard} from './guards/auth.jwt-guards';
import {Request as ExpressRequest} from 'express';

import {RequestWithUser} from '../common/types/request.types';

@Controller('auth')
@UsePipes(new ValidationPipe({whitelist: true}))
export class AuthController {
    constructor(private readonly authService: AuthService) {
    }

    @Post('register')
    async register(@Body() createUserDto: CreateUserDto) {
        return this.authService.register(createUserDto);
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Get('csrf-token')
    getCsrf(@Req() req: ExpressRequest): { csrfToken: string } {
        const token = req.csrfToken();
        return {csrfToken: token};
    }

    @HttpCode(204)
    @UseGuards(JwtRefreshGuard)
    @Post('logout')
    async logout(@Request() req: RequestWithUser) {
        return this.authService.logout(req.user.userId, String(req.user.nonce));
    }

    @UseGuards(JwtRefreshGuard)
    @Post('/access-token/refresh')
    async refreshToken(@Request() req: RequestWithUser) {
        return this.authService.refreshToken(req.user.userId, Number(req.user.createdAt), String(req.user.nonce));
    }

    @UseGuards(JwtResetPasswordGuard)
    @Post('reset-password/:confirm_token') //TODO: (not now) add guard for 1 time use(redis)
    async resetPasswordWithConfirmToken(@Body() newPasswordDto: newPasswordDto, @Request() req: RequestWithUser) {
        return this.authService.resetPasswordWithConfirmToken(newPasswordDto, req.user.userId);
    }

    //TODO: (not now) add email verification guard for 1 time use(redis)
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
