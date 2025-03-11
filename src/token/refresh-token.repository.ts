import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { User } from '../user/entity/user.entity';

@Injectable()
export class RefreshTokenRepository {
    constructor(
        @InjectRepository(RefreshToken)
        private readonly refreshTokenRepo: Repository<RefreshToken>,

        @InjectRepository(User) // Добавляем репозиторий для User
        private readonly userRepository: Repository<User>,
    ) { }

    async saveToken(data: Partial<RefreshToken>): Promise<RefreshToken> {
        // Ищем пользователя по userId
        const user = await this.userRepository.findOne({ where: { id: data.userId } });

        if (!user) {
            throw new NotFoundException(`User with id ${data.userId} not found`);
        }

        return this.refreshTokenRepo.save(data); // Сохраняем токен
    }

    // Метод для поиска токена
    async findByTokenAndUserId(userId: number, token: string): Promise<RefreshToken | null> {
        return this.refreshTokenRepo.findOne({ where: { refreshToken: token, user: { id: userId }} });
    }

    // async findByUserId(userId: number): Promise<RefreshToken | null> {
    //     return this.refreshTokenRepo.findOne({ where: { user: { id: userId } } });
    // }

    // // Метод для удаления токена
    // async deleteToken(token: string): Promise<void> {
    //     await this.refreshTokenRepo.delete({ refreshToken: token });
    // }

    // Метод для удаления всех токенов пользователя
    async deleteTokensByUserId(userId: number): Promise<void> {
        await this.refreshTokenRepo.delete({ userId: userId});
    }

    async deleteTokenById(tokenId: number): Promise<void> {
        await this.refreshTokenRepo.delete({ id: tokenId });
    }
}
