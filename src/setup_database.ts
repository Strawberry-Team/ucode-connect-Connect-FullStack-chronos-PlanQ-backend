// src/setup_database.ts
import { createConnection, Connection } from 'mysql2/promise';
import { rootConfig } from './config/database.root.config';
import databaseConfig from './config/database.app.config';

async function setupDatabase(): Promise<void> {
    let connection: Connection | null = null;

    try {
        const config = databaseConfig();

        connection = await createConnection({
            host: rootConfig.host,
            port: rootConfig.port,
            user: rootConfig.user,
            password: rootConfig.password
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.database.name}\``);
        await connection.query(`GRANT ALL PRIVILEGES ON \`${config.database.name}\`.* TO '${config.database.username}'@'${config.database.host}'`);
        await connection.query(`FLUSH PRIVILEGES`);
    } catch (error) {
        console.error('Error setting up the database:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

setupDatabase();