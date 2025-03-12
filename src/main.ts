import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {ValidationPipe} from '@nestjs/common';
import {NestExpressApplication} from '@nestjs/platform-express';
import {ConfigService} from '@nestjs/config';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.useGlobalPipes(
        new ValidationPipe({whitelist: true, transform: true}),
    );

    const configService = app.get(ConfigService);
    const globalPrefix = String(configService.get<string>('app.globalPrefix'));
    const port = Number(configService.get<number>('app.port'));
    const host = String(configService.get<number>('app.host'));
    const protocol = String(configService.get<number>('app.protocol'));

    app.setGlobalPrefix(globalPrefix);

    app.useStaticAssets('public');

    await app.listen(port);
    console.log(`Application is running on: ${protocol}://${host}:${port}/${globalPrefix}`);
}

bootstrap();