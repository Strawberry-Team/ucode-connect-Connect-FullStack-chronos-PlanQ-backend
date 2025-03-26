// src/config/google.config.ts
import * as dotenv from 'dotenv';
import {validateEnv} from '../common/utils/env.utils';
import appConfig from './app.config';

dotenv.config();

export default () => {
    const appConfiguration = appConfig();

    return {
        google: {
            clientId: String(validateEnv('GOOGLE_CLIENT_ID')),
            clientSecret: String(validateEnv('GOOGLE_CLIENT_SECRET')),
            gmailApi: {
                user: String(validateEnv('GOOGLE_GMAIL_USER')),
                refreshToken: String(validateEnv('GOOGLE_GMAIL_API_REFRESH_TOKEN')),
            },
            redirectUri: appConfiguration.app.frontendLink,
            playgroundRedirectUri: String(validateEnv('GOOGLE_PLAYGROUND_REDIRECT_URI')),
            calendarApi: {
                refreshToken: String(validateEnv('GOOGLE_CALENDAR_API_REFRESH_TOKEN')),
                maxResults: parseInt(String(validateEnv('GOOGLE_CALENDAR_API_MAX_RESULTS')), 10),
                dataFile: {
                    path: String(validateEnv('GOOGLE_CALENDAR_API_HOLIDAY_CALENDARS_DATA_FILE_PATH'))
                }
            }
        }
    };
};  