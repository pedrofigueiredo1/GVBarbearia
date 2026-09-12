import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// @Global() evita ter que importar o PrismaModule em cada módulo de feature
// (Profissionais, Serviços, Produtos...) que precisar acessar o banco.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
