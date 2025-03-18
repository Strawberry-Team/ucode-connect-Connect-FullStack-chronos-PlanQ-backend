import {Injectable} from '@nestjs/common';
import {Cron, Timeout} from '@nestjs/schedule';
import {RefreshTokenNonceService} from 'src/token/refresh-token-nonce.service';
import {ConfigService} from '@nestjs/config';
import {convertToSeconds} from 'src/common/utils/time.utils';
import {SchedulerConfig} from 'src/config/scheduler.config';
import { RefreshTokenNonce } from 'src/token/entities/refresh-token-nonce.entity';

@Injectable()
export class JwtCleanSchedulerService {
    constructor(
        private readonly NonceService: RefreshTokenNonceService,
        private configService: ConfigService,
    ) {
    }

    @Cron(SchedulerConfig.prototype.cleanRefreshTokensFromDb)
    @Timeout(10000)
    async cleanRefreshTokensFromDb() {
        const expirationTime = convertToSeconds((String(this.configService.get<string>(`jwt.expiresIn.refresh`))));
        const nonces: RefreshTokenNonce[] = await this.NonceService.getAll(expirationTime);

        if (nonces.length > 0) {
            await Promise.all(nonces.map(nonce =>
                this.NonceService.deleteRefreshTokenNonceByNonceId(nonce.id)
            ));
        } else {
        }
    }
}
