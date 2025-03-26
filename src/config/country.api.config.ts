// src/config/country.api.config.ts
import * as dotenv from 'dotenv';
import { validateEnv } from '../common/utils/env.utils';

dotenv.config();

export default () => {
    return {
        countryApi: {
            url: String(validateEnv('COUNTRY_API_URL')),
        },
    };
};