import { Controller, Get, Injectable, Query, Res, HttpStatus, InternalServerErrorException} from '@nestjs/common';
import { CountryService } from './country.service';
import { Response } from 'express';

@Controller('country')
export class CountryController {
    constructor(private readonly countriesService: CountryService) { }
    
    /**
   * GET /countries
   * Возвращает список стран с названием, двубуквенным кодом и ссылкой на флаг.
   */
    @Get()
    async getAllCountries(): Promise<any> {
        try {
            const result = await this.countriesService.getCountries();
            console.log("We got all countries: ", result)
            return result;
        } catch (error) {
            // return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message:  });
        
            throw new InternalServerErrorException('Error retrieving countries data.')
        }
    }

    /**
     * GET /countries/holidays?countryCode=<код>&lang=<язык>
     * Заглушка для получения национальных праздников.
     */
    @Get('holidays')
    async getCountryHolidays(
        @Query('countryCode') countryCode: string,
        @Query('lang') lang: string,
        @Res() res: Response,
    ): Promise<any> {
        // В будущем здесь можно реализовать вызов другого API для получения праздников.
        return res.status(HttpStatus.NOT_IMPLEMENTED).json({ message: 'National holidays endpoint not supported yet.' });
    }

}
