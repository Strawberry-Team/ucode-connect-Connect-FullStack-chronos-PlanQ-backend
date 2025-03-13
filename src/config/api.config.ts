import * as dotenv from 'dotenv';
import { validateEnv } from '../common/utils/env.utils';

dotenv.config();

export default () => {
    return {
        api: {
            countryApiUrl: String(validateEnv('COUNTRY_API_URL')),
        },
    };
};