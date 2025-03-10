import * as dotenv from 'dotenv';
import { validateEnv } from '../common/utils/env.utils';

dotenv.config();

export default () => ({
  jwt: {
    secrets: {
      access: validateEnv('JWT_ACCESS_SECRET'),
      refresh: validateEnv('JWT_REFRESH_SECRET'),
      email: validateEnv('JWT_EMAIL_SECRET'),
      passwordReset: validateEnv('JWT_PASSWORD_RESET_SECRET'),
    },
    expiresIn: {
      access: validateEnv('JWT_ACCESS_EXPIRES_IN'),
      refresh: validateEnv('JWT_REFRESH_EXPIRES_IN'),
      email: validateEnv('JWT_EMAIL_EXPIRES_IN'),
      passwordReset: validateEnv('JWT_PASSWORD_RESET_EXPIRES_IN'),
    },
  },
});