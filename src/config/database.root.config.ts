// database.root.config.ts
import * as dotenv from 'dotenv';

dotenv.config();

export interface DatabaseRootConfig {
    host: string;
    user: string;
    password: string;
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

export const rootConfig: DatabaseRootConfig = {
    host: validateEnv('DB_ROOT_HOST'),
    user: validateEnv('DB_ROOT_USER'),
    password: validateEnv('DB_ROOT_PASSWORD'),
    connectionLimit: Number(validateEnv('DB_ROOT_CONNECTION_LIMIT')),
};