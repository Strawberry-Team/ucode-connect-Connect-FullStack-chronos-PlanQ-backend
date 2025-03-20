import * as dotenv from 'dotenv';
import {validateEnv} from '../common/utils/env.utils';

dotenv.config();

export default () => {
    return {
        calendar: {
            defaultMain: {
                name: String(validateEnv('CALENDAR_DEFAULT_MAIN_NAME')),
                description: String(validateEnv('CALENDAR_DEFAULT_MAIN_DESCRIPTION')),
                color: String(validateEnv('CALENDAR_DEFAULT_MAIN_COLOR')),
            },
            defaultHoliday: {
                name: String(validateEnv('CALENDAR_DEFAULT_HOLIDAY_NAME')),
                description: String(validateEnv('CALENDAR_DEFAULT_HOLIDAY_DESCRIPTION')),
                color: String(validateEnv('CALENDAR_DEFAULT_HOLIDAY_COLOR')),
            },
        },
    };
};