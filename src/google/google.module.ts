// src/google/google.module.ts
import {Module} from '@nestjs/common';
import {GoogleOAuthService} from './google-oauth.service';
import {ConfigModule} from '@nestjs/config';
import googleConfig from '../config/google.config';

@Module({
    imports: [ConfigModule.forFeature(googleConfig)],
    providers: [GoogleOAuthService],
    exports: [GoogleOAuthService],
})
export class GoogleModule {
}
