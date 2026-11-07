import { Module } from '@nestjs/common';
import { AgendamentosController } from './agendamentos.controller';
import { AgendamentosClienteController } from './agendamentos-cliente.controller';
import { AdicionarAgendamento } from './operacoes/adicionar-agendamento';
import { AdicionarAgendamentoCliente } from './operacoes/adicionar-agendamento-cliente';
import { CancelarAgendamentoCliente } from './operacoes/cancelar-agendamento-cliente';
import { ConsultarHorariosDisponiveis } from './operacoes/consultar-horarios-disponiveis';
import { ListarAgendamentosCliente } from './operacoes/listar-agendamentos-cliente';
import { ListarAgendamentos } from './operacoes/listar-agendamentos';
import { ListarAgendamentosPaginado } from './operacoes/listar-agendamentos-paginado';
import { BuscarAgendamento } from './operacoes/buscar-agendamento';
import { EditarAgendamento } from './operacoes/editar-agendamento';
import { CancelarAgendamento } from './operacoes/cancelar-agendamento';
import { ConsultarDatasBloqueadas } from './operacoes/consultar-datas-bloqueadas';
import {
  ValidarReferenciasAgendamento,
  ValidarHorarioDisponivel,
  ValidarAgendaAberta,
} from './operacoes/compartilhado';

@Module({
  controllers: [AgendamentosController, AgendamentosClienteController],
  providers: [
    AdicionarAgendamento,
    AdicionarAgendamentoCliente,
    ListarAgendamentosCliente,
    CancelarAgendamentoCliente,
    ConsultarHorariosDisponiveis,
    ConsultarDatasBloqueadas,
    ListarAgendamentos,
    ListarAgendamentosPaginado,
    BuscarAgendamento,
    EditarAgendamento,
    CancelarAgendamento,
    ValidarReferenciasAgendamento,
    ValidarHorarioDisponivel,
    ValidarAgendaAberta,
  ],
})
export class AgendamentosModule {}
