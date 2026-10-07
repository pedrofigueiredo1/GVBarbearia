import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FiltrosRelatorioDto } from './dto/filtros-relatorio.dto';
import { RelatorioAgendamentos } from './operacoes/relatorio-agendamentos';
import { RelatorioServicosMaisAgendados } from './operacoes/relatorio-servicos-mais-agendados';
import { RelatorioAtendimentoProfissional } from './operacoes/relatorio-atendimento-profissional';
import { RelatorioClientes } from './operacoes/relatorio-clientes';
import { RelatorioAvaliacoes } from './operacoes/relatorio-avaliacoes';

@UseGuards(JwtAuthGuard)
@Controller('relatorios')
export class RelatoriosController {
  constructor(
    private readonly relatorioAgendamentos: RelatorioAgendamentos,
    private readonly relatorioServicosMaisAgendados: RelatorioServicosMaisAgendados,
    private readonly relatorioAtendimentoProfissional: RelatorioAtendimentoProfissional,
    private readonly relatorioClientes: RelatorioClientes,
    private readonly relatorioAvaliacoes: RelatorioAvaliacoes,
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

  // ===== RELATORIO DE ATENDIMENTO POR PROFISSIONAL =====
  @Get('atendimento-profissional')
  atendimentoProfissional(@Query() filtros: FiltrosRelatorioDto) {
    return this.relatorioAtendimentoProfissional.executar(filtros);
  }

  // ===== RELATORIO DE CLIENTES =====
  @Get('clientes')
  clientes(@Query() filtros: FiltrosRelatorioDto) {
    return this.relatorioClientes.executar(filtros);
  }

  // ===== RELATORIO DE AVALIACOES =====
  @Get('avaliacoes')
  avaliacoes(@Query() filtros: FiltrosRelatorioDto) {
    return this.relatorioAvaliacoes.executar(filtros);
  }
}
