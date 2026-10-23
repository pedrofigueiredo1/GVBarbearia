import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClienteJwtAuthGuard } from '../auth-cliente/cliente-jwt-auth.guard';
import { ConsultarHorariosDisponiveisDto } from './dto/consultar-horarios-disponiveis.dto';
import { CreateAgendamentoClienteDto } from './dto/create-agendamento-cliente.dto';
import { AdicionarAgendamentoCliente } from './operacoes/adicionar-agendamento-cliente';
import { CancelarAgendamentoCliente } from './operacoes/cancelar-agendamento-cliente';
import { ConsultarHorariosDisponiveis } from './operacoes/consultar-horarios-disponiveis';
import { ListarAgendamentosCliente } from './operacoes/listar-agendamentos-cliente';

// Rotas do cliente logado no app. Ficam em /meus-agendamentos, separadas de
// /agendamentos (painel), e só aceitam token de CLIENTE. O cliente sempre vem
// do token (req.user), nunca do corpo ou da URL.
@UseGuards(ClienteJwtAuthGuard)
@Controller('meus-agendamentos')
export class AgendamentosClienteController {
  constructor(
    private readonly adicionarAgendamentoCliente: AdicionarAgendamentoCliente,
    private readonly listarAgendamentosCliente: ListarAgendamentosCliente,
    private readonly cancelarAgendamentoCliente: CancelarAgendamentoCliente,
    private readonly consultarHorariosDisponiveis: ConsultarHorariosDisponiveis,
  ) {}

  // ===== CADASTRAR AGENDAMENTO PELO CLIENTE =====
  @Post()
  create(
    @Req() req: { user: { id: number } },
    @Body() dto: CreateAgendamentoClienteDto,
  ) {
    return this.adicionarAgendamentoCliente.executar(req.user.id, dto);
  }

  // ===== LISTAR AGENDAMENTOS DO CLIENTE =====
  @Get()
  findAll(@Req() req: { user: { id: number } }) {
    return this.listarAgendamentosCliente.executar(req.user.id);
  }

  // ===== CONSULTAR HORÁRIOS DISPONÍVEIS =====
  // Fica antes de ':id' (DELETE) só por organização; os métodos são diferentes.
  @Get('horarios-disponiveis')
  horariosDisponiveis(
    @Req() req: { user: { id: number } },
    @Query() query: ConsultarHorariosDisponiveisDto,
  ) {
    return this.consultarHorariosDisponiveis.executar(req.user.id, query);
  }

  // ===== CANCELAR AGENDAMENTO PELO CLIENTE =====
  @Delete(':id')
  cancelar(
    @Req() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cancelarAgendamentoCliente.executar(req.user.id, id);
  }
}
