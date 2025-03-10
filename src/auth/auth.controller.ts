import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from '../token/dto/refresh-token.dto';
import { ResetPasswordDto } from '../auth/dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { BaseCrudController } from '../common/controller/base-crud.controller';
import { Token } from '../token/entities/token.entity';
import { CreateTokenDto } from '../token/dto/create-token.dto';

@Controller('auth')
export class AuthController extends BaseCrudController<Token, CreateTokenDto, never> {
    constructor(private readonly authService: AuthService) {
        super();
    }

    @Post('register')
    async register(@Body() createUserDto: CreateUserDto) {
        return this.authService.register(createUserDto);
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('refresh')
    async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
        return this.authService.refreshToken(refreshTokenDto);
    }

    @Post('remind-password')
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto);
    }

    protected async findById(id: number): Promise<Token> {
        return this.authService.getTokenById(id);
    }

    protected async createEntity(dto: CreateTokenDto): Promise<Token> {
        return this.authService.createToken(dto);
    }

    protected async updateEntity(): Promise<never> {
        throw new Error('Update method is not implemented for tokens.');
    }

    protected async deleteEntity(id: number): Promise<void> {
        return this.authService.deleteToken(id);
    }
}
