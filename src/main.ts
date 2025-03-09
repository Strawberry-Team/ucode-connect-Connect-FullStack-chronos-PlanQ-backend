import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
  );

  // Глобальный префикс для API
  app.setGlobalPrefix('api');

  // Раздача статики (например, для аватарок)
  app.useStaticAssets('public');

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api`);
}

bootstrap();