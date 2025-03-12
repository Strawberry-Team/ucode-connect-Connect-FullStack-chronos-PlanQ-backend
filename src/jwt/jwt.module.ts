import {Module, Global} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import {JwtUtils} from './jwt-token.utils';

@Global()
@Module({
    imports: [
        JwtModule.register({}), // Minimal configuration as JwtUtils handles details
    ],
    providers: [JwtUtils],
    exports: [JwtUtils, JwtModule],
})
export class JwtConfigModule {
}