import { Module } from '@nestjs/common';
import { BarbeariaController } from './barbearia.controller';
import { ConsultarBarbearia } from './operacoes/consultar-barbearia';
import { EditarBarbearia } from './operacoes/editar-barbearia';

@Module({
  controllers: [BarbeariaController],
  providers: [ConsultarBarbearia, EditarBarbearia],
})
export class BarbeariaModule {}
