import * as dotenv from 'dotenv';
import {validateEnv} from '../common/utils/env.utils';

dotenv.config();

export default () => {
    const frontendProtocol = String(validateEnv('APP_FRONTEND_PROTOCOL'));
    const frontendHost = String(validateEnv('APP_FRONTEND_HOST'));
    const frontendPort = parseInt(String(validateEnv('APP_FRONTEND_PORT')), 10);

    return {
        app: {
            port: parseInt(String(validateEnv('APP_PORT')), 10),
            host: String(validateEnv('APP_HOST')),
            globalPrefix: String(validateEnv('APP_GLOBAL_PREFIX')),
            protocol: String(validateEnv('APP_PROTOCOL')),
            passwordSaltRounds: parseInt(String(validateEnv('APP_PASSWORD_BCRYPT_SALT_ROUNDS'))),
            frontendProtocol,
            frontendHost,
            frontendPort,
            frontendLink: `${frontendProtocol}://${frontendHost}:${frontendPort}`,
            nodeEnv: String(validateEnv('APP_NODE_ENV')),
            cors: {
                methods: String(validateEnv('APP_CORS_METHODS')).split(','),
                allowedHeaders: String(validateEnv('APP_CORS_ALLOWED_HEADERS')).split(','),
                credentials: Boolean(validateEnv('APP_CORS_CREDENTIALS')),
            },
            csrf: {
                cookie: {
                    key: String(validateEnv('CSRF_COOKIE_KEY')),
                    httpOnly: validateEnv('CSRF_COOKIE_HTTP_ONLY') === 'true',
                    sameSite: String(validateEnv('CSRF_COOKIE_SAME_SITE')),
                    secure: validateEnv('CSRF_COOKIE_SECURE') === 'true',
                },
                ignoreMethods: String(validateEnv('CSRF_IGNORE_METHODS')).split(','),
            }
        }
    };
};