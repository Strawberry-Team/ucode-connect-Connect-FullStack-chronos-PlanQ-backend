import {Injectable} from '@nestjs/common';
import {Cron, Timeout} from '@nestjs/schedule';
import {SchedulerConfig} from 'src/config/scheduler.config';
import {CountryService} from 'src/country/country.service';

@Injectable()
export class CountriesSchedulerService {
    constructor(
        private readonly countryService: CountryService,
    ) {
    }

    @Timeout(100)
    @Cron(SchedulerConfig.prototype.updateCountries)
    async updateCountries() {
        await this.countryService.refreshCountries()
    }
}
