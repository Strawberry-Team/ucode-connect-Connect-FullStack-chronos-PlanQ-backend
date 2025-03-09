import { createConnection, Connection } from 'mysql2/promise';
import { exec } from 'child_process';
import { rootConfig } from './config/database.root.config';
import { appConfig } from './config/database.app.config';

async function setupDatabase(): Promise<void> {
    let connection: Connection | null = null;

    try {
        if (!appConfig.database) {
            throw new Error('Database name is not defined in the configuration.');
        }

        connection = await createConnection({
            host: rootConfig.host,
            user: rootConfig.user,
            password: rootConfig.password
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${appConfig.database}\``);
        console.log(`Database "${appConfig.database}" created successfully.`);

        await connection.query(`GRANT ALL PRIVILEGES ON \`${appConfig.database}\`.* TO '${appConfig.user}'@'${appConfig.host}'`);
        await connection.query(`FLUSH PRIVILEGES`);
        console.log(`Privileges granted to user "${appConfig.user}"`);
    } catch (error) {
        console.error('Error setting up the database:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

setupDatabase();