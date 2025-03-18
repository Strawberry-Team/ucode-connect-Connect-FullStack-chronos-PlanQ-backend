import {forwardRef, Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {RefreshTokenNonceService} from './refresh-token-nonce.service';
import {RefreshTokenNonceRepository} from './refresh-token-nonce.repository';
import {JwtModule} from '@nestjs/jwt';
import {AuthModule} from 'src/auth/auth.module';
import {UsersModule} from 'src/user/users.module';
import { NonceUtils } from '../common/utils/nonce.utils';
import { RefreshTokenNonce } from './entities/refresh-token-nonce.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([RefreshTokenNonce]),
        JwtModule.register({}),
        forwardRef(() => AuthModule),
        UsersModule
    ],
    providers: [RefreshTokenNonceService, RefreshTokenNonceRepository, NonceUtils],
    exports: [RefreshTokenNonceService, NonceUtils],
})
export class RefreshTokenNonceModule {
}
