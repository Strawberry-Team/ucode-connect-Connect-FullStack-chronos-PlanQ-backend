import {Injectable} from '@nestjs/common';
import {Cron, Timeout} from '@nestjs/schedule';
import {RefreshToken} from 'src/token/entities/refresh-token.entity';
import {RefreshTokenService} from 'src/token/refresh-token.service';
import {ConfigService} from '@nestjs/config';
import {convertToSeconds} from 'src/common/utils/time.utils';
import {SchedulerConfig} from 'src/config/scheduler.config';

@Injectable()
export class JwtCleanSchedulerService {
    constructor(
        private readonly refreshTokenService: RefreshTokenService,
        private configService: ConfigService,
    ) {
    }

    @Cron(SchedulerConfig.prototype.cleanRefreshTokensFromDb)
    @Timeout(10000)
    async cleanRefreshTokensFromDb() {
        const EXPIRATION_TIME = convertToSeconds((String(this.configService.get<string>(`jwt.expiresIn.refresh`))));
        const refreshTokens: RefreshToken[] = await this.refreshTokenService.getAll(EXPIRATION_TIME);

        if (refreshTokens.length > 0) {
            await Promise.all(refreshTokens.map(token =>
                this.refreshTokenService.deleteTokenByTokenID(token.id)
            ));
        } else {
        }
    }
}
