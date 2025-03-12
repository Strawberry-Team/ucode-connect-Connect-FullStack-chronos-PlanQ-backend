import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import {CreateRefreshTokenDto} from './dto/create-refresh-token.dto';
import {RefreshToken} from './entities/refresh-token.entity';
import {RefreshTokenRepository} from './refresh-token.repository';

@Injectable()
export class RefreshTokenService {
    constructor(
        private readonly refreshTokenRepository: RefreshTokenRepository
    ) {
    }

    async getTokenByTokenAndUserId(userId: number, token: string): Promise<RefreshToken> {
        const tokenRes = await this.refreshTokenRepository.findByTokenAndUserId(userId, token);
        if (!tokenRes) {
            throw new NotFoundException(
                `Refresh token for user id ${userId} not found`
            );
        }
        return tokenRes;
    }

    async createToken(createTokenDto: CreateRefreshTokenDto): Promise<RefreshToken> {
        return await this.refreshTokenRepository.saveToken(createTokenDto);
    }

    async deleteTokensByUserID(userId: number): Promise<void> {
        return await this.refreshTokenRepository.deleteTokensByUserId(userId);
    }

    async deleteTokenByUserID(tokenId: number): Promise<void> {
        return await this.refreshTokenRepository.deleteTokenById(tokenId);
    }
}