import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProfissionaisModule } from './profissionais/profissionais.module';
import { ServicosModule } from './servicos/servicos.module';
import { ProdutosModule } from './produtos/produtos.module';
import { BarbeariaModule } from './barbearia/barbearia.module';
import { AuthModule } from './auth/auth.module';
import { AdministradoresModule } from './administradores/administradores.module';
import { ClientesModule } from './clientes/clientes.module';
import { AgendamentosModule } from './agendamentos/agendamentos.module';
import { AvaliacoesModule } from './avaliacoes/avaliacoes.module';
import { RelatoriosModule } from './relatorios/relatorios.module';
import { AuthClienteModule } from './auth-cliente/auth-cliente.module';
import { PublicoModule } from './publico/publico.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Limite geral por IP: 120 requisições por minuto. As rotas sensíveis (login,
    // cadastro, recuperação de senha) têm limites bem menores, definidos nos
    // próprios controllers com @Throttle.
    ThrottlerModule.forRoot({
      errorMessage: 'Muitas tentativas. Aguarde um pouco e tente novamente.',
      throttlers: [{ ttl: 60_000, limit: 120 }],
      // Só para rodar os testes automáticos da API, que fazem muitos logins
      // seguidos. Nunca defina isto em produção.
      skipIf: () => process.env.DESATIVAR_LIMITE_DE_REQUISICOES === 'true',
    }),
    PrismaModule,
    ProfissionaisModule,
    ServicosModule,
    ProdutosModule,
    BarbeariaModule,
    AuthModule,
    AdministradoresModule,
    ClientesModule,
    AgendamentosModule,
    AvaliacoesModule,
    RelatoriosModule,
    AuthClienteModule,
    PublicoModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
