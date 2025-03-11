// token.module.ts
import {forwardRef, Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {RefreshTokenService} from './refresh-token.service';
import {RefreshTokenRepository} from './refresh-token.repository';
import {JwtModule} from '@nestjs/jwt';
//import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
//import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {RefreshToken} from './entities/refresh-token.entity';
import {AuthModule} from 'src/auth/auth.module';
import {UsersModule} from 'src/user/users.module';

// import { UsersRepository } from 'src/user/users.repository';

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
