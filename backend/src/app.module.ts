import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProfissionaisModule } from './profissionais/profissionais.module';
import { ServicosModule } from './servicos/servicos.module';
import { ProdutosModule } from './produtos/produtos.module';
import { BarbeariaModule } from './barbearia/barbearia.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ProfissionaisModule,
    ServicosModule,
    ProdutosModule,
    BarbeariaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
