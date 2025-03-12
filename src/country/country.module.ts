import { Module } from '@nestjs/common';
import { CountryService } from '../country.service'; // Adjust the import path as necessary
import { CountryController } from './country.controller';
import { CountryService } from './country.service';

@Module({
    providers: [CountryService,],
    exports: [CountryService],
    controllers: [CountryController],
})
export class CountryModule {}