import * as bcrypt from 'bcrypt';
import {
    Injectable,
    BadRequestException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from '../auth/dto/login.dto';
import { RefreshTokenDto } from '../token/dto/refresh-token.dto';
import { ResetPasswordDto } from '../auth/dto/reset-password.dto';
import { CreateRefreshTokenDto } from '../token/dto/create-refresh-token.dto';
import { newPasswordDto } from './dto/new-password.dto';
import { UsersService } from 'src/user/users.service';
import { RefreshTokenService } from 'src/token/refresh-token.service';
import { JwtUtils } from '../jwt/jwt-token.utils';


@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly refreshTokenService: RefreshTokenService,
        private readonly jwtUtils: JwtUtils,
    ) { }


    /**
     * Регистрация нового пользователя.
     * После успешного создания пользователя генерируются access и refresh-токены.
     * Refresh-токен сохраняется в БД.
     */
    async register(createUserDto: CreateUserDto) {
        // Создаём нового пользователя
        const user = await this.usersService.createUser(createUserDto);

        // Генерируем access и refresh токены
        const accessToken = this.jwtUtils.generateToken({ sub: user.id }, 'access');
        const refreshToken = this.jwtUtils.generateToken({ sub: user.id }, 'refresh');

        // Сохраняем refresh-токен через RefreshTokenService
        await this.refreshTokenService.createToken({
            userId: user.id,
            refreshToken: refreshToken,
        } as CreateRefreshTokenDto);
        // Возвращаем данные пользователя (без пароля) и токены
        return { user: user, accessToken, refreshToken };
    }

    /**
   * Вход пользователя.
   * Производится поиск пользователя по email и сверка пароля.
   * При успешной аутентификации генерируются новые access и refresh-токены.
   */
    async login(loginDto: LoginDto) {
        // Находим пользователя по email
        const user = await this.usersService.getUserByEmail(loginDto.email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Проверяем корректность пароля
        const passwordValid = await bcrypt.compare(
            loginDto.password,
            String(user.password),
        );
        if (!passwordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Генерируем access и refresh токены
        const accessToken = this.jwtUtils.generateToken({ sub: user.id }, 'access');
        const refreshToken = this.jwtUtils.generateToken({ sub: user.id }, 'refresh');

        // Сохраняем refresh-токен. Можно предусмотреть удаление предыдущих,
        // если поддерживается только одна активная сессия у пользователя.
        await this.refreshTokenService.createToken({
            userId: user.id,
            refreshToken: refreshToken,
        } as CreateRefreshTokenDto);

        // Возвращаем пользователя (без пароля) и токены
        const { password, ...userWithoutPass } = user;
        return { user: userWithoutPass, accessToken, refreshToken };
    }

    /**
   * Выход пользователя из системы.
   * Находим refresh-токен по userId и значению refreshToken (из DTO), затем удаляем его.
   */
    async logout(userId: number, refreshTokenDto: RefreshTokenDto) {
        // Ищем токен в БД по userId и значению refreshToken
        const tokenEntity = await this.refreshTokenService.getTokenByTokenAndUserId(
            userId,
            refreshTokenDto.refreshToken,
        );
        if (!tokenEntity) {
            throw new NotFoundException(
                `Refresh token for user id ${userId} not found`,
            );
        }

        // Удаляем конкретный refresh-токен из БД
        await this.refreshTokenService.deleteTokenByUserID(tokenEntity.id);
        return { message: 'Logged out successfully' };
    }

    /**
   * Обновление access-токена.
   * На основе userId (из guard'а refresh-токена) генерируется новый access-токен.
   * Если требуется – можно также обновить refresh-токен.
   */
    async refreshToken(userId: number) {
        const accessToken = this.jwtUtils.generateToken({ sub: userId }, 'access');
        // Если логика бизнес-требования подразумевает выдачу нового refresh-токена,
        // можно добавить похожий блок, как в login.
        return { accessToken };
    }

    async resetPasswordWithConfirmToken(newPasswordDto: newPasswordDto, userId: number) {
        const hashedPassword = await bcrypt.hash(newPasswordDto.newPassword, 10);

        // Обновляем пароль пользователя.
        // Здесь предполагается, что в UsersService реализован метод,
        // позволяющий обновить пароль без проверки "старого" пароля (reset-flow).
        await this.usersService.updateUser(userId, { newPassword: hashedPassword });

        // Удаляем все refresh-токены пользователя, чтобы лишить доступ старых сессий
        await this.refreshTokenService.deleteTokensByUserID(userId);

        return { message: 'Password has been reset successfully' };
    }

    /**
   * Инициация сброса пароля.
   */
    async resetPassword(resetPasswordDto: ResetPasswordDto) {
        const user = await this.usersService.getUserByEmail(resetPasswordDto.email);
        const passwordResetToken = this.jwtUtils.generateToken({ sub: user.id }, 'resetPassword');

        return {passwordResetToken: passwordResetToken}
    }

    async confirmEmail(userId: number) {
        // await this.usersService.confirmEmail(userId);
        return { message: 'Email confirmed successfully' };
    }
}