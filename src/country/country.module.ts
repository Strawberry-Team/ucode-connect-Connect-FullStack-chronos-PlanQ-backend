import { Module } from '@nestjs/common';
import { CountryService } from './country.service';
import { CountryController } from './country.controller';
import { IsValidCountryCodeConstraint } from './country.validator';

@Module({

    controllers: [CountryController],
    providers: [CountryController, IsValidCountryCodeConstraint, CountryService],
    exports: [CountryController, IsValidCountryCodeConstraint, CountryService],
}) 
export class CountryModule { }