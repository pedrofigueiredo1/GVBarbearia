import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// Centraliza a conexão com o banco: o Nest cuida de abrir/fechar a conexão
// junto com o ciclo de vida do módulo, então nenhum outro serviço precisa
// se preocupar em chamar connect()/disconnect() manualmente.
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
