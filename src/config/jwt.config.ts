import * as dotenv from 'dotenv';
import { validateEnv } from '../common/utils/env.utils';

dotenv.config();

export default () => ({
    jwt: {
        secrets: {
            access: validateEnv('JWT_ACCESS_SECRET'),
            refresh: validateEnv('JWT_REFRESH_SECRET'),
            confirmEmail: validateEnv('JWT_CONFIRM_EMAIL_SECRET'),
            resetPassword: validateEnv('JWT_RESET_PASSWORD_SECRET'),
            confirmCalendar: validateEnv('JWT_CONFIRM_CALENDAR_SECRET'),
            confirmArrangement: validateEnv('JWT_CONFIRM_ARRANGEMENT_SECRET'),
        },
        expiresIn: {
            access: validateEnv('JWT_ACCESS_EXPIRES_IN'),
            refresh: validateEnv('JWT_REFRESH_EXPIRES_IN'),
            confirmEmail: validateEnv('JWT_CONFIRM_EMAIL_EXPIRES_IN'),
            resetPassword: validateEnv('JWT_RESET_PASSWORD_EXPIRES_IN'),
            confirmCalendar: validateEnv('JWT_CONFIRM_CALENDAR_EXPIRES_IN'),
            confirmArrangement: validateEnv('JWT_CONFIRM_ARRANGEMENT_EXPIRES_IN'),
        },
        issuer: {
            auth: validateEnv('JWT_ISSUER'),
            calendar: validateEnv('JWT_CALENDAR_ISSUER'),
            event: validateEnv('JWT_EVENT_ISSUER'),
        },
        audience: {
            auth: validateEnv('JWT_AUDIENCE'),
            calendar: validateEnv('JWT_CALENDAR_AUDIENCE'),
            event: validateEnv('JWT_EVENT_AUDIENCE'),
        },
        algorithm: validateEnv('JWT_ALGORITHM'),
    },
});