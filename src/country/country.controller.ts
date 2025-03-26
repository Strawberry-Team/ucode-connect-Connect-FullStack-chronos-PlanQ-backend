// src/country/country.controller.ts
import {Controller, Get} from '@nestjs/common';
import {CountryService} from './country.service';

@Controller('countries')
export class CountryController {
    @Get()
    async getAllCountries(): Promise<any> {
        return await CountryService.getCountries();
    }
}
