// src/tasks/tasks.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Interval, Timeout } from '@nestjs/schedule';
import { RefreshToken } from 'src/token/entities/refresh-token.entity';
import { RefreshTokenService } from 'src/token/refresh-token.service';
import {ConfigService} from '@nestjs/config';
import { convertToSeconds } from 'src/common/utils/time.utils';

@Injectable()
export class JwtCleanSchedulerService {
    constructor(
        private readonly refreshTokenService: RefreshTokenService,
        private configService: ConfigService,
    ) {
    }

    @Cron(CronExpression.EVERY_DAY_AT_10AM)
    @Timeout(10000)
    async cleanRefreshTokensFromDb() {
        const EXPIRATION_TIME = convertToSeconds(parseInt(String(this.configService.get<string>(`jwt.expiresIn.refresh`))), 'd');
        // console.log("EXPIRATION_DAYS = ", EXPIRATION_TIME)
        const refreshTokens: RefreshToken[] = await this.refreshTokenService.getAll(EXPIRATION_TIME);
        // console.log("refreshTokens = ", refreshTokens)
        const now = new Date();

        if (refreshTokens.length > 0) {
            await Promise.all(refreshTokens.map(token => 
                this.refreshTokenService.deleteTokenByTokenID(token.id)
            ));

            // console.log(`Удалено просроченных refresh-токенов: ${refreshTokens.length}`);
        } else {
            // console.log('Нет просроченных refresh-токенов');
        }
    }
}
