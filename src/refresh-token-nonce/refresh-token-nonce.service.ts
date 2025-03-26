// src/refresh-token-nonce/refresh-token-nonce.service.ts
import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CreateRefreshTokenNonceDto } from './dto/create-refresh-nonce.dto';
import { RefreshTokenNonce } from './entity/refresh-token-nonce.entity';
import { RefreshTokenNonceRepository } from './refresh-token-nonce.repository';

@Injectable()
export class RefreshTokenNonceService {
    constructor(
        private readonly nonceRepository: RefreshTokenNonceRepository
    ) {
    }

    async getAll(time?: number): Promise<RefreshTokenNonce[]> {
        return await this.nonceRepository.getAll(time);
    }

    async getRefreshTokenNonceByNonceAndUserId(userId: number, nonce: string): Promise<RefreshTokenNonce> {
        const NonceRes = await this.nonceRepository.findByRefreshTokenNonceAndUserId(userId, nonce);
        if (!NonceRes) {
            throw new NotFoundException(
                `Nonce for user id ${userId} not found`
            );
        }
        return NonceRes;
    }

    async createRefreshTokenNonce(createTokenDto: CreateRefreshTokenNonceDto): Promise<RefreshTokenNonce> {
        return await this.nonceRepository.saveRefreshTokenNonce(createTokenDto);
    }

    async deleteRefreshTokenNoncesByUserId(userId: number): Promise<void> {
        return await this.nonceRepository.deleteRefreshTokenNoncesByUserId(userId);
    }

    async deleteRefreshTokenNonceByNonceId(NonceId: number): Promise<void> {
        return await this.nonceRepository.deleteRefreshTokenNonceById(NonceId);
    }
}