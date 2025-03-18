import * as dotenv from 'dotenv';
import { validateEnv } from '../common/utils/env.utils';
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
            calendarApi: {
                refreshToken: String(validateEnv('GOOGLE_CALENDAR_API_REFRESH_TOKEN')),
            }
        }
    };
};  