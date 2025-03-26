// src/country/country.module.ts
import {Module} from '@nestjs/common';
import {CountryService} from './country.service';
import {CountryController} from './country.controller';
import {IsValidCountryCodeConstraint} from './country.validator';
import {HttpModule} from '@nestjs/axios';

@Module({
    imports: [HttpModule],
    controllers: [CountryController],
    providers: [CountryController, IsValidCountryCodeConstraint, CountryService],
    exports: [CountryController, IsValidCountryCodeConstraint, CountryService],
})
export class CountryModule {
}