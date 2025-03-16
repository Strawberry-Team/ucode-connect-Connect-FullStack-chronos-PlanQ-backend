import {Controller, Get, NotImplementedException, Query, Res} from '@nestjs/common';
import {CountryService} from './country.service';
import {Response} from 'express';

@Controller('countries')
export class CountryController {
    constructor(private readonly countriesService: CountryService) {
    }

    @Get()
    async getAllCountries(): Promise<any> {
        return await CountryService.getCountries();
    }


    @Get('holidays') //TODO: перенести в контроллер calendars
    async getCountryHolidays(
        @Res() res: Response,
    ): Promise<any> {
        //TODO: added another language support(apart from English)
        //TODO: В будущем здесь можно реализовать вызов другого Calendar Google API для получения праздников. Возвращать и на английском, и на локальном
        throw new NotImplementedException('National holidays endpoint not supported yet.');
    }

}
