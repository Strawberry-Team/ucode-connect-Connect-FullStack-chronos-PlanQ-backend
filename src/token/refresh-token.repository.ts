import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';

@Injectable()
export class RefreshTokenRepository {
    constructor(
        @InjectRepository(RefreshToken)
        private readonly refreshTokenRepo: Repository<RefreshToken>
    ) {
    }

    async getAll(seconds?: number): Promise<RefreshToken[]> {
        const whereCondition: any = {};

        if (seconds !== undefined) { // Проверяем, передано ли значение
            const thresholdDate = new Date();
            thresholdDate.setSeconds(thresholdDate.getSeconds() - Number(seconds));
            whereCondition.createdAt = LessThan(thresholdDate);
        }

        return this.refreshTokenRepo.find({
            where: whereCondition,
            order: { createdAt: 'DESC' },
        });
    }

    async saveToken(data: Partial<RefreshToken>): Promise<RefreshToken> {
        return this.refreshTokenRepo.save(data);
    }

    async findByTokenAndUserId(userId: number, token: string): Promise<RefreshToken | null> {
        return this.refreshTokenRepo.findOne({ where: { refreshToken: token, user: { id: userId } } });
    }

    async deleteTokensByUserId(userId: number): Promise<void> {
        await this.refreshTokenRepo.delete({ userId: userId });
    }

    async deleteTokenById(tokenId: number): Promise<void> {
        await this.refreshTokenRepo.delete({ id: tokenId });
    }
}
