import * as dotenv from 'dotenv';
import {validateEnv} from '../common/utils/env.utils';

dotenv.config();

export default () => {
    return {
        calendar: {
            default: {
                name: String(validateEnv('CALENDAR_DEFAULT_NAME')),
                description: String(validateEnv('CALENDAR_DEFAULT_DESCRIPTION')),
                color: String(validateEnv('CALENDAR_DEFAULT_COLOR')),
            },
        },
    };
};