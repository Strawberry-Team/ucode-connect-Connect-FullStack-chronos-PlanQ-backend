import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {LessThan, Repository} from 'typeorm';
import {RefreshToken} from './entities/refresh-token.entity';

@Injectable()
export class RefreshTokenRepository {
    constructor(
        @InjectRepository(RefreshToken)
        private readonly refreshTokenRepo: Repository<RefreshToken>
    ) {
    }

    async getAll(seconsd?: number): Promise<RefreshToken[]> {
        const thresholdDate = new Date();
        thresholdDate.setSeconds(thresholdDate.getSeconds() - Number(seconsd));

        return this.refreshTokenRepo.find({
            where: {
                createdAt: LessThan(thresholdDate), 
            },
            order: { createdAt: 'DESC' },
        });
    }
    
    async saveToken(data: Partial<RefreshToken>): Promise<RefreshToken> {
        return this.refreshTokenRepo.save(data);
    }

    async findByTokenAndUserId(userId: number, token: string): Promise<RefreshToken | null> {
        return this.refreshTokenRepo.findOne({where: {refreshToken: token, user: {id: userId}}});
    }

    async deleteTokensByUserId(userId: number): Promise<void> {
        await this.refreshTokenRepo.delete({userId: userId});
    }

    async deleteTokenById(tokenId: number): Promise<void> {
        await this.refreshTokenRepo.delete({id: tokenId});
    }
}
