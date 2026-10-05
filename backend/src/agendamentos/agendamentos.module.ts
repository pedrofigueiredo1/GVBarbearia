import { Module } from '@nestjs/common';
import { AgendamentosController } from './agendamentos.controller';
import { AdicionarAgendamento } from './operacoes/adicionar-agendamento';
import { ListarAgendamentos } from './operacoes/listar-agendamentos';
import { BuscarAgendamento } from './operacoes/buscar-agendamento';
import { EditarAgendamento } from './operacoes/editar-agendamento';
import { CancelarAgendamento } from './operacoes/cancelar-agendamento';
import {
  ValidarReferenciasAgendamento,
  ValidarHorarioDisponivel,
} from './operacoes/compartilhado';

@Module({
  controllers: [AgendamentosController],
  providers: [
    AdicionarAgendamento,
    ListarAgendamentos,
    BuscarAgendamento,
    EditarAgendamento,
    CancelarAgendamento,
    ValidarReferenciasAgendamento,
    ValidarHorarioDisponivel,
  ],
})
export class AgendamentosModule {}
