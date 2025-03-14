// src/tasks/tasks.module.ts
import { Module } from '@nestjs/common';
import { NotificationSchedulerService } from './services/notification-scheduler.service';
import { CountriesShedulerService } from './services/countries-sheduler.service';
import { JwtCleanSchedulerService } from './services/jwt-clean-scheduler.service';
import { RefreshTokenService } from 'src/token/refresh-token.service';
import { RefreshTokenRepository } from 'src/token/refresh-token.repository';
import { RefreshTokenModule } from 'src/token/refresh-token.module';
import { CountryModule } from 'src/country/country.module';
import { UsersModule } from 'src/user/users.module';
import { SchedulerConfig } from 'src/config/scheduler.config';

@Module({
    imports: [RefreshTokenModule, CountryModule, UsersModule],
    providers: [NotificationSchedulerService, CountriesShedulerService, JwtCleanSchedulerService, SchedulerConfig],
})
export class SchedulerTasksModule { }
