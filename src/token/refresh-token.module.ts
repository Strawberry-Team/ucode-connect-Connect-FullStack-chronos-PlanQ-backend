import {forwardRef, Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {RefreshTokenService} from './refresh-token.service';
import {RefreshTokenRepository} from './refresh-token.repository';
import {JwtModule} from '@nestjs/jwt';
import {RefreshToken} from './entities/refresh-token.entity';
import {AuthModule} from 'src/auth/auth.module';
import {UsersModule} from 'src/user/users.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([RefreshToken]),
        JwtModule.register({}),
        forwardRef(() => AuthModule),
        UsersModule
    ],
    controllers: [],
    providers: [RefreshTokenService, RefreshTokenRepository],
    exports: [RefreshTokenService],
})
export class RefreshTokenModule {
}
