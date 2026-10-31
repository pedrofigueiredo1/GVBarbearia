// ===== CONSULTAR DASHBOARD =====
// Ctrl+F "CONSULTAR DASHBOARD" para achar este bloco.
// Junta as três partes do dashboard numa única resposta, para o painel buscar
// tudo com uma chamada só.
import { Injectable } from '@nestjs/common';
import { IndicadoresDoPeriodo } from './indicadores-do-periodo';
import { PassagemDeClientes } from './passagem-de-clientes';
import { ResumoDoDia } from './resumo-do-dia';

@Injectable()
export class ConsultarDashboard {
  constructor(
    private readonly passagemDeClientes: PassagemDeClientes,
    private readonly resumoDoDia: ResumoDoDia,
    private readonly indicadoresDoPeriodo: IndicadoresDoPeriodo,
  ) {}

  async executar() {
    const [passagem, dia, indicadores] = await Promise.all([
      this.passagemDeClientes.executar(),
      this.resumoDoDia.executar(),
      this.indicadoresDoPeriodo.executar(),
    ]);
    return { passagem, ...dia, indicadores };
  }
}
