import { Module } from '@nestjs/common';
import { ClientesController } from './clientes.controller';
import { AdicionarCliente } from './operacoes/adicionar-cliente';
import { ListarClientes } from './operacoes/listar-clientes';
import { BuscarCliente } from './operacoes/buscar-cliente';
import { EditarCliente } from './operacoes/editar-cliente';
import { ExcluirCliente } from './operacoes/excluir-cliente';

@Module({
  controllers: [ClientesController],
  providers: [
    AdicionarCliente,
    ListarClientes,
    BuscarCliente,
    EditarCliente,
    ExcluirCliente,
  ],
  exports: [BuscarCliente],
})
export class ClientesModule {}
