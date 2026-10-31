import { Module } from '@nestjs/common';
import { ClientesController } from './clientes.controller';
import { ClientesClienteController } from './clientes-cliente.controller';
import { AdicionarCliente } from './operacoes/adicionar-cliente';
import { ListarClientes } from './operacoes/listar-clientes';
import { ListarClientesPaginado } from './operacoes/listar-clientes-paginado';
import { BuscarCliente } from './operacoes/buscar-cliente';
import { EditarCliente } from './operacoes/editar-cliente';
import { EditarPerfilCliente } from './operacoes/editar-perfil-cliente';
import { ExcluirCliente } from './operacoes/excluir-cliente';

@Module({
  controllers: [ClientesController, ClientesClienteController],
  providers: [
    AdicionarCliente,
    ListarClientes,
    ListarClientesPaginado,
    BuscarCliente,
    EditarCliente,
    EditarPerfilCliente,
    ExcluirCliente,
  ],
  exports: [AdicionarCliente, BuscarCliente],
})
export class ClientesModule {}
