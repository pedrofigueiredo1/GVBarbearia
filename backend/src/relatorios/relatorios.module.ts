import { Module } from '@nestjs/common';
import { RelatoriosController } from './relatorios.controller';
import { RelatorioAgendamentos } from './operacoes/relatorio-agendamentos';
import { RelatorioServicosMaisAgendados } from './operacoes/relatorio-servicos-mais-agendados';
import { RelatorioAtendimentoProfissional } from './operacoes/relatorio-atendimento-profissional';
import { RelatorioClientes } from './operacoes/relatorio-clientes';
import { RelatorioAvaliacoes } from './operacoes/relatorio-avaliacoes';

@Module({
  controllers: [RelatoriosController],
  providers: [
    RelatorioAgendamentos,
    RelatorioServicosMaisAgendados,
    RelatorioAtendimentoProfissional,
    RelatorioClientes,
    RelatorioAvaliacoes,
  ],
})
export class RelatoriosModule {}
