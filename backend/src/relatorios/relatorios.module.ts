import { Module } from '@nestjs/common';
import { RelatoriosController } from './relatorios.controller';
import { RelatorioAgendamentos } from './operacoes/relatorio-agendamentos';
import { RelatorioServicosMaisAgendados } from './operacoes/relatorio-servicos-mais-agendados';

@Module({
  controllers: [RelatoriosController],
  providers: [RelatorioAgendamentos, RelatorioServicosMaisAgendados],
})
export class RelatoriosModule {}
