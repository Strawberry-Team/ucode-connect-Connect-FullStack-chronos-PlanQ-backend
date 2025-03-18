import * as dotenv from 'dotenv';
import {validateEnv} from '../common/utils/env.utils';

dotenv.config();

export default () => {
    const frontendProtocol = String(validateEnv('APP_FRONTEND_PROTOCOL'));
    const frontendHost = String(validateEnv('APP_FRONTEND_HOST'));
    const frontendPort = parseInt(String(validateEnv('APP_FRONTEND_PORT')), 10);

    return {
        app: {
            name: String(validateEnv('APP_NAME')),
            port: parseInt(String(validateEnv('APP_PORT')), 10),
            host: String(validateEnv('APP_HOST')),
            globalPrefix: String(validateEnv('APP_GLOBAL_PREFIX')),
            protocol: String(validateEnv('APP_PROTOCOL')),
            passwordSaltRounds: parseInt(String(validateEnv('APP_PASSWORD_BCRYPT_SALT_ROUNDS'))),
            frontendProtocol,
            frontendHost,
            frontendPort,
            frontendLink: `${frontendProtocol}://${frontendHost}:${frontendPort}/`,
            nodeEnv: String(validateEnv('APP_NODE_ENV')),
            cors: {
                methods: String(validateEnv('APP_CORS_METHODS')).split(','),
                allowedHeaders: String(validateEnv('APP_CORS_ALLOWED_HEADERS')).split(','),
                credentials: Boolean(validateEnv('APP_CORS_CREDENTIALS')),
            },
            csrf: {
                cookie: {
                    key: String(validateEnv('APP_CSRF_COOKIE_KEY')),
                    httpOnly: Boolean(validateEnv('APP_CSRF_COOKIE_HTTP_ONLY')),
                    sameSite: String(validateEnv('APP_CSRF_COOKIE_SAME_SITE')),
                },
                ignoreMethods: String(validateEnv('APP_CSRF_IGNORE_METHODS')).split(','),
            },
            imags: {
                logo: String(validateEnv('IMAGE_BASE64'))
            }
        }
    };
};