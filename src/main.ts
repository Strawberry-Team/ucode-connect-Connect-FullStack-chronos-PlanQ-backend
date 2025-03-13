import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {ValidationPipe} from '@nestjs/common';
import {NestExpressApplication} from '@nestjs/platform-express';
import {ConfigService} from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import * as csurf from 'csurf';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.useGlobalPipes(
        new ValidationPipe({whitelist: true, transform: true}),
    );

    app.use(cookieParser());

    const configService = app.get(ConfigService);
    const globalPrefix = String(configService.get<string>('app.globalPrefix'));
    const port = Number(configService.get<number>('app.port'));
    const host = String(configService.get<number>('app.host'));
    const protocol = String(configService.get<number>('app.protocol'));
    const frontendOrigin = String(configService.get<string>('app.frontendLink'));
    const csrfConfig = configService.get('app.csrf');
    console.log('csrfConfig', csrfConfig);

    app.setGlobalPrefix(globalPrefix);

    app.useStaticAssets('public');

    const csrfProtection = csurf({
        cookie: csrfConfig.cookie,
        ignoreMethods: csrfConfig.ignoreMethods
    });

    // Apply CSRF middleware
    app.use((req, res, next) => {
        // Only apply to non-ignored methods (POST, PUT, DELETE, etc.)
        if (!csrfConfig.ignoreMethods.includes(req.method)) {
            return csrfProtection(req, res, next);
        }
        next();
    });

    // Set CSRF token in cookie for GET requests
    app.use((req, res, next) => {
        if (req.method === 'GET') {
            res.cookie(csrfConfig.cookie.key, req.csrfToken());
        }
        next();
    });

    app.enableCors({
        origin: frontendOrigin,
        methods: configService.get('app.cors.methods'),
        allowedHeaders: configService.get('app.cors.allowedHeaders'),
        credentials: true, // Required to send cookies cross-origin
    });

    await app.listen(port);
    console.log(`Application is running on: ${protocol}://${host}:${port}/${globalPrefix}`);
}

bootstrap();