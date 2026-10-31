import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { ConsultarDashboard } from './operacoes/consultar-dashboard';
import { IndicadoresDoPeriodo } from './operacoes/indicadores-do-periodo';
import { PassagemDeClientes } from './operacoes/passagem-de-clientes';
import { ResumoDoDia } from './operacoes/resumo-do-dia';

@Module({
  controllers: [DashboardController],
  providers: [
    ConsultarDashboard,
    PassagemDeClientes,
    ResumoDoDia,
    IndicadoresDoPeriodo,
  ],
})
export class DashboardModule {}
