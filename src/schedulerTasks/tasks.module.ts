import {Module} from '@nestjs/common';
import {NotificationSchedulerService} from './services/notification-scheduler.service';
import {CountriesSchedulerService} from './services/countries-scheduler.service';
import {JwtCleanSchedulerService} from './services/jwt-clean-scheduler.service';
import {RefreshTokenModule} from 'src/token/refresh-token.module';
import {CountryModule} from 'src/country/country.module';
import {UsersModule} from 'src/user/users.module';
import {SchedulerConfig} from 'src/config/scheduler.config';

@Module({
    imports: [RefreshTokenModule, CountryModule, UsersModule],
    providers: [NotificationSchedulerService, CountriesSchedulerService, JwtCleanSchedulerService, SchedulerConfig],
})
export class SchedulerTasksModule {
}
