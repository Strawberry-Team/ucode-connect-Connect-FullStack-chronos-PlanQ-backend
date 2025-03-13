import {Injectable, InternalServerErrorException, Logger} from '@nestjs/common';
import * as path from 'path';
import {promises as fs} from 'fs';
import { HttpService } from '@nestjs/axios'
import {ConfigService} from "@nestjs/config";
import {firstValueFrom} from "rxjs";

@Injectable()
export class CountryService {
    private readonly filePath = path.join(__dirname, '..', 'data', 'countries.json');

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService
    ) {}

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
            const apiUrl = String(this.configService.get<string>('api.countryApiUrl'));
            const response = await firstValueFrom(this.httpService.get(apiUrl));
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
