import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS liberado para o painel administrativo (Next.js) acessar a API, mais
  // as origens extras de CORS_ORIGINS (o app do cliente rodando no navegador,
  // durante os testes). O app no celular não passa por CORS.
  const origensExtras = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origem) => origem.trim())
    .filter(Boolean);
  app.enableCors({
    origin: [
      process.env.ADMIN_URL ?? 'http://localhost:3001',
      ...origensExtras,
    ],
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
