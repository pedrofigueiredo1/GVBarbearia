import { Module } from '@nestjs/common';
import { ServicosController } from './servicos.controller';
import { AdicionarServico } from './operacoes/adicionar-servico';
import { ListarServicos } from './operacoes/listar-servicos';
import { BuscarServico } from './operacoes/buscar-servico';
import { EditarServico } from './operacoes/editar-servico';
import { ExcluirServico } from './operacoes/excluir-servico';

@Module({
  controllers: [ServicosController],
  providers: [
    AdicionarServico,
    ListarServicos,
    BuscarServico,
    EditarServico,
    ExcluirServico,
  ],
})
export class ServicosModule {}
