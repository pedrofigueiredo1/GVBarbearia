import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cabeçalhos de segurança (e remove o X-Powered-By, que revelava o Express).
  app.use(helmet());

  // Em produção a API fica atrás de um proxy (Render): sem isto, o IP visto seria
  // sempre o do proxy e o limite de tentativas valeria para todos juntos.
  if (process.env.NODE_ENV === 'production') {
    app.getHttpAdapter().getInstance().set('trust proxy', 1);
  }

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
