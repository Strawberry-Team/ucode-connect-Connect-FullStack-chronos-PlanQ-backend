import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
  );

  // Глобальный префикс для API
  app.setGlobalPrefix('api');

  // Раздача статики (например, для аватарок)
  app.useStaticAssets('public');

  const configService = app.get(ConfigService);
  const port = Number(configService.get<number>('app.port'));

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api`);
}

bootstrap();