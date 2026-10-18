import { Module } from '@nestjs/common';
import { AvaliacoesController } from './avaliacoes.controller';
import { AvaliacoesClienteController } from './avaliacoes-cliente.controller';
import { AdicionarAvaliacaoCliente } from './operacoes/adicionar-avaliacao-cliente';
import { ListarAvaliacoes } from './operacoes/listar-avaliacoes';
import { BuscarAvaliacao } from './operacoes/buscar-avaliacao';
import { EditarAvaliacao } from './operacoes/editar-avaliacao';
import { ExcluirAvaliacao } from './operacoes/excluir-avaliacao';

@Module({
  controllers: [AvaliacoesController, AvaliacoesClienteController],
  providers: [
    AdicionarAvaliacaoCliente,
    ListarAvaliacoes,
    BuscarAvaliacao,
    EditarAvaliacao,
    ExcluirAvaliacao,
  ],
})
export class AvaliacoesModule {}
