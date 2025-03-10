import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
// import { RefreshTokenDto } from '../token/dto/refresh-token.dto';
import { ResetPasswordDto } from '../auth/dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-access.guard';
import { BaseCrudController } from '../common/controller/base-crud.controller';
import { RefreshToken } from '../token/entities/refresh-token.entity';
import { CreateRefreshTokenDto } from '../token/dto/create-refresh-token.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard'

@Controller('auth')
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

    @UseGuards(JwtRefreshGuard) 
    @Post('logout')
    async logout(@Request() req) {
        return this.authService.logout(loginDto);
    }

    @UseGuards(JwtRefreshGuard) 
    @Post('/access-token/refresh')
    async refreshToken(@Request() req) {
        return this.authService.refreshToken(req.user.userId);
    }

    @Post('reset-password')
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto);
    }
}
