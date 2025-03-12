import * as dotenv from 'dotenv';
import {validateEnv} from '../common/utils/env.utils';

dotenv.config();

export default () => {
    return {
        app: {
            port: parseInt(String(validateEnv('APP_PORT')), 10),
            host: String(validateEnv('APP_HOST')),
            globalPrefix: String(validateEnv('APP_GLOBAL_PREFIX')),
            protocol: String(validateEnv('APP_PROTOCOL')),
            passwordSaltRounds: parseInt(String(validateEnv('APP_PASSWORD_BCRYPT_SALT_ROUNDS'))),
            frontendPort: parseInt(String(validateEnv('APP_FRONTEND_PORT'))),
            frontendHost: String(validateEnv('APP_FRONTEND_HOST')),
            frontendProtocol: String(validateEnv('APP_FRONTEND_PROTOCOL')),
        },
    };
};