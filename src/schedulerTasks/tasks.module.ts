// src/schedulerTasks/tasks.module.ts
import { Module } from '@nestjs/common';
import { NotificationSchedulerService } from './services/notification-scheduler.service';
import { CountriesSchedulerService } from './services/countries-scheduler.service';
import { JwtCleanSchedulerService } from './services/jwt-clean-scheduler.service';
import { RefreshTokenNonceModule } from 'src/refresh-token-nonce/refresh-token-nonce.module';
import { CountryModule } from 'src/country/country.module';
import { UsersModule } from 'src/user/users.module';
import { SchedulerConfig } from 'src/config/scheduler.config';

@Module({
    imports: [RefreshTokenNonceModule, CountryModule, UsersModule],
    providers: [NotificationSchedulerService, CountriesSchedulerService, JwtCleanSchedulerService, SchedulerConfig],
})
export class SchedulerTasksModule {
}
