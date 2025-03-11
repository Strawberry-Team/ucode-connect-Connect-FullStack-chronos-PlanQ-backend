import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { User } from '../user/entity/user.entity';
import { UsersRepository } from 'src/user/users.repository';

@Injectable()
export class RefreshTokenRepository {
    constructor(
        @InjectRepository(RefreshToken)
        private readonly refreshTokenRepo: Repository<RefreshToken>
    ) { }

    async saveToken(data: Partial<RefreshToken>): Promise<RefreshToken> {
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
