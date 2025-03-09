// database.app.config.ts
import * as dotenv from 'dotenv';

dotenv.config();

export interface DatabaseAppConfig {
    host: string;
    user: string;
    password: string;
    database: string;
    connectionLimit: number;
}

// Validate required environment variables
function validateEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

export const appConfig: DatabaseAppConfig = {
    host: validateEnv('DB_APP_HOST'),
    user: validateEnv('DB_APP_USER'),
    password: validateEnv('DB_APP_PASSWORD'),
    database: validateEnv('DB_APP_DATABASE'),
    connectionLimit: Number(validateEnv('DB_APP_CONNECTION_LIMIT')),
};