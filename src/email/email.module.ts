// src/email/email.module.ts
import {Module} from '@nestjs/common';
import {EmailService} from './email.service';
import {ConfigModule} from '@nestjs/config';
import googleConfig from '../config/google.config';
import appConfig from '../config/app.config';
import {GoogleModule} from '../google/google.module';

@Module({
    imports: [
        ConfigModule.forFeature(googleConfig),
        ConfigModule.forFeature(appConfig),
        GoogleModule,
    ],
    providers: [EmailService],
    exports: [EmailService],
})
export class EmailModule {
}
