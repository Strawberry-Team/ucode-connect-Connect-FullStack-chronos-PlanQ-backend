import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { User } from '../user/entity/user.entity';

@Injectable()
export class RefreshTokenRepository {
    constructor(
        @InjectRepository(RefreshToken)
        private readonly tokenRepository: Repository<RefreshToken>,

        @InjectRepository(User) // Добавляем репозиторий для User
        private readonly userRepository: Repository<User>,
    ) { }

    async saveToken(userId: number, token: string): Promise<RefreshToken> {
        // Ищем пользователя по userId
        const user = await this.userRepository.findOne({ where: { id: userId } });

        if (!user) {
            throw new Error('User not found');
        }

        // Создаем токен с привязкой к найденному пользователю
        const newToken = this.tokenRepository.create({
            user,  // Связываем токен с пользователем
            refreshToken: token, // Присваиваем refreshToken
        });

        return this.tokenRepository.save(newToken); // Сохраняем токен
    }
    
    // Метод для поиска токена
    async findToken(token: string): Promise<RefreshToken | null> {
        return this.tokenRepository.findOne({ where: { refreshToken: token } });
    }

    // Метод для удаления токена
    async deleteToken(token: string): Promise<void> {
        await this.tokenRepository.delete({ refreshToken: token });
    }

    // Метод для удаления всех токенов пользователя
    async deleteTokensByUser(userId: number): Promise<void> {
        await this.tokenRepository.delete({ user: { id: userId } });
    }
}
