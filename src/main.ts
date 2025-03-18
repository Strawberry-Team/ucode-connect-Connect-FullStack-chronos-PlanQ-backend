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
    const baseUrl = `${protocol}://${host}${port ? `:${port}` : ''}`;
    const frontendOrigin = String(configService.get<string>('app.frontendLink'));
    const csrfConfig = configService.get('app.csrf');
    const corsConfig = configService.get('app.cors');
    const nodeEnv = String(configService.get('app.nodeEnv'));

    app.setGlobalPrefix(globalPrefix);

    app.useStaticAssets('public');

    app.enableCors({
        origin: frontendOrigin,
        methods: corsConfig.methods,
        allowedHeaders: corsConfig.allowedHeaders,
        credentials: corsConfig.credentials, // Required to send cookies cross-origin
    });

    app.use(
        csurf({
            cookie: {
                key: csrfConfig.cookie.key,
                httpOnly: csrfConfig.cookie.httpOnly, //Not available via JS
                secure: nodeEnv === 'production', //cookies are only transmitted via HTTPS
                sameSite: csrfConfig.cookie.sameSite, //Cookies will only be sent for requests originating from the same domain (site)
            },
            ignoreMethods: csrfConfig.ignoreMethods,
        }),
    );

    await app.listen(port);
    console.log(`Application is running on: ${baseUrl}/${globalPrefix}`);
}

bootstrap();