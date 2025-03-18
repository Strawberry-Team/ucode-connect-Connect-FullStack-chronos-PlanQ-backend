import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {LessThan, Repository} from 'typeorm';
import {RefreshTokenNonce} from './entities/refresh-token-nonce.entity';

@Injectable()
export class RefreshTokenNonceRepository {
    constructor(
        @InjectRepository(RefreshTokenNonce)
        private readonly nonceRepo: Repository<RefreshTokenNonce>
    ) {
    }

    async getAll(seconds?: number): Promise<RefreshTokenNonce[]> {
        const whereCondition: any = {};

        if (seconds !== undefined) {
            const thresholdDate = new Date();
            thresholdDate.setSeconds(thresholdDate.getSeconds() - Number(seconds));
            whereCondition.createdAt = LessThan(thresholdDate);
        }

        return this.nonceRepo.find({
            where: whereCondition,
            order: {createdAt: 'DESC'},
        });
    }

    async saveRefreshTokenNonce(data: Partial<RefreshTokenNonce>): Promise<RefreshTokenNonce> {
        return this.nonceRepo.save(data);
    }

    async findByRefreshTokenNonceAndUserId(userId: number, nonce: string): Promise<RefreshTokenNonce | null> {
        return this.nonceRepo.findOne({where: {nonce: nonce, user: {id: userId}}});
    }

    async deleteRefreshTokenNoncesByUserId(userId: number): Promise<void> {
        await this.nonceRepo.delete({userId: userId});
    }

    async deleteRefreshTokenNonceById(nonceId: number): Promise<void> {
        await this.nonceRepo.delete({id: nonceId});
    }
}
