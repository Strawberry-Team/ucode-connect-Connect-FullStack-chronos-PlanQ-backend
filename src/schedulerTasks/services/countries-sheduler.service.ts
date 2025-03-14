// src/tasks/tasks.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Interval, Timeout } from '@nestjs/schedule';
import { SchedulerConfig } from 'src/config/scheduler.config';
import { CountryService } from 'src/country/country.service';

@Injectable()
export class CountriesShedulerService {
  constructor(
    private readonly countryService: CountryService,
    private readonly schedulerConfig: SchedulerConfig
    // private configService: ConfigService,
  ) {
  }

  @Timeout(100)
  @Cron(SchedulerConfig.prototype.updateCountries)
  async updateCountries() {
    // console.log("Updating countries...")
    await this.countryService.refreshCountries()
    // console.log("Countries was updated")
  }
}
