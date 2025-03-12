import {Controller, Get, NotImplementedException, Query, Res} from '@nestjs/common';
import {CountryService} from './country.service';
import {Response} from 'express';

@Controller('country')
export class CountryController {
    constructor(private readonly countriesService: CountryService) {
    }

    @Get()
    async getAllCountries(): Promise<any> {
        return await this.countriesService.getCountries();
    }


    @Get('holidays')
    async getCountryHolidays(
        @Query('countryCode') countryCode: string,
        @Query('lang') lang: string,
        @Res() res: Response,
    ): Promise<any> {
        //TODO: В будущем здесь можно реализовать вызов другого API для получения праздников.
        throw new NotImplementedException('National holidays endpoint not supported yet.');
    }

}
