import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS liberado para o painel administrativo (Next.js) acessar a API.
  app.enableCors({
    origin: process.env.ADMIN_URL ?? 'http://localhost:3001',
  });

  // Valida e sanitiza automaticamente o body de toda requisição usando os
  // decorators dos DTOs (@IsNotEmpty, @MaxLength, etc.), rejeitando com 400
  // qualquer campo que não esteja definido nos DTOs (whitelist).
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
