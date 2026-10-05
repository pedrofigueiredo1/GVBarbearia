import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FiltrosRelatorioDto } from './dto/filtros-relatorio.dto';
import { RelatorioAgendamentos } from './operacoes/relatorio-agendamentos';
import { RelatorioServicosMaisAgendados } from './operacoes/relatorio-servicos-mais-agendados';

@UseGuards(JwtAuthGuard)
@Controller('relatorios')
export class RelatoriosController {
  constructor(
    private readonly relatorioAgendamentos: RelatorioAgendamentos,
    private readonly relatorioServicosMaisAgendados: RelatorioServicosMaisAgendados,
  ) {}

  // ===== RELATORIO DE AGENDAMENTOS =====
  @Get('agendamentos')
  agendamentos(@Query() filtros: FiltrosRelatorioDto) {
    return this.relatorioAgendamentos.executar(filtros);
  }

  // ===== RELATORIO DE SERVICOS MAIS AGENDADOS =====
  @Get('servicos-mais-agendados')
  servicosMaisAgendados(@Query() filtros: FiltrosRelatorioDto) {
    return this.relatorioServicosMaisAgendados.executar(filtros);
  }
}
