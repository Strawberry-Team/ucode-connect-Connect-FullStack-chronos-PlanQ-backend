// src/tasks/tasks.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Interval, Timeout } from '@nestjs/schedule';
import { CountryService } from 'src/country/country.service';

@Injectable()
export class CountriesShedulerService {
  constructor(
    private readonly countryService: CountryService,
    // private configService: ConfigService,
  ) {
  }


  @Timeout(100)
  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async updateCountries() {
    // console.log("Updating countries...")
    await this.countryService.refreshCountries()
    // console.log("Countries was updated")
  }
}
