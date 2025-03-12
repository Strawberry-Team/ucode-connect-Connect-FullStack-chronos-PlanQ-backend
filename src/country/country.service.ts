import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import { promises as fs } from 'fs';
import axios from 'axios';

@Injectable()
export class CountryService {
    //private readonly logger = new Logger(CountryService.name);
    // Путь к файлу, где будем сохранять данные стран
    private readonly filePath = path.join(__dirname, '..', 'data', 'countries.json');

    /**
     * Возвращает список стран.
     * Если файл с данными не найден, производится запрос к внешнему API,
     * данные сохраняются, а затем считываются.
     */
    async getCountries(): Promise<any[]> {
        try {
            console.log("filePath", this.filePath);
            const data = await fs.readFile(this.filePath, 'utf8');
            console.log("We read the this.filePath");
            return JSON.parse(data);
        } catch (error) {
            // this.logger.log('Countries data file not found. Refreshing from API...');
            console.log('Countries data file not found. Refreshing from API...');
            // Если файла нет или произошла ошибка чтения, сначала обновляем данные
            await this.refreshCountries();
            const data = await fs.readFile(this.filePath, 'utf8');
            return JSON.parse(data);
        }
    }

    /**
     * Обновляет данные стран, делая запрос к внешнему API,
     * фильтрует нужные поля и сохраняет результат в JSON файл.
     */
    async refreshCountries(): Promise<void> {
        try {
            const response = await axios.get(
                'https://restcountries.com/v3.1/all?fields=name,cca2,flags'
            );
            // Переформатируем данные:
            const countries = response.data.map((country) => ({
                name: country.name.common,
                code: country.cca2,
                flag: country.flags?.png ?? null,
            }));
            // Обеспечиваем существование директории для файла данных
            const dataDir = path.dirname(this.filePath);
            await fs.mkdir(dataDir, { recursive: true });
            // Сохраняем данные с отступами для удобства чтения
            await fs.writeFile(this.filePath, JSON.stringify(countries, null, 2));
            // this.logger.log('Countries data refreshed successfully.');
            console.log('Countries data refreshed successfully.');
        } catch (error) {
            // this.logger.error('Error fetching countries from external API', error);
            console.error('Error fetching countries from external API', error);
            throw error;
        }
    }

    /**
     * Возвращает список валидных кодов стран для использования в валидаторе.
     */
    async getValidCountryCodes(): Promise<string[]> {
        console.log("getValidCountryCodes")
        const countries = await this.getCountries();
        return countries.map((country) => country.code);
    }
}
