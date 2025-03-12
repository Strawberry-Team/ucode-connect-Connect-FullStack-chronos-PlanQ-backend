import {Injectable, InternalServerErrorException, Logger} from '@nestjs/common';
import * as path from 'path';
import {promises as fs} from 'fs';
import axios from 'axios';

@Injectable()
export class CountryService {
    private readonly filePath = path.join(__dirname, '..', 'data', 'countries.json');

    async getCountries(): Promise<any[]> {
        try {
            const data = await fs.readFile(this.filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            await this.refreshCountries();
            const data = await fs.readFile(this.filePath, 'utf8');
            return JSON.parse(data);
        }
    }

    async refreshCountries(): Promise<void> {
        try {
            const response = await axios.get( //TODO: посмотреть как в nestJS api
                'https://restcountries.com/v3.1/all?fields=name,cca2,flags' //TODO: in config
            );
            const countries = response.data.map((country) => ({
                name: country.name.common,
                code: country.cca2,
                flag: country.flags?.png ?? null,
            }));
            const dataDir = path.dirname(this.filePath);
            await fs.mkdir(dataDir, {recursive: true});
            await fs.writeFile(this.filePath, JSON.stringify(countries, null, 2));
        } catch (error) {
            throw new InternalServerErrorException('Error refreshing countries data.');
        }
    }

    async getValidCountryCodes(): Promise<string[]> {
        const countries = await this.getCountries();
        return countries.map((country) => country.code);
    }
}
