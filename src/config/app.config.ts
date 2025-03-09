// app.config.ts
import * as dotenv from 'dotenv';
import { validateEnv } from '../common/utils/env.utils';

dotenv.config();

export default () => ({
    app: {
        port: parseInt(validateEnv('APP_PORT'), 10),
    }
});