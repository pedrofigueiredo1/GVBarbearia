import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateAgendamentoDto } from './dto/create-agendamento.dto';
import { UpdateAgendamentoDto } from './dto/update-agendamento.dto';
import { AdicionarAgendamento } from './operacoes/adicionar-agendamento';
import { ListarAgendamentos } from './operacoes/listar-agendamentos';
import { BuscarAgendamento } from './operacoes/buscar-agendamento';
import { EditarAgendamento } from './operacoes/editar-agendamento';
import { CancelarAgendamento } from './operacoes/cancelar-agendamento';

@UseGuards(JwtAuthGuard)
@Controller('agendamentos')
export class AgendamentosController {
  constructor(
    private readonly adicionarAgendamento: AdicionarAgendamento,
    private readonly listarAgendamentos: ListarAgendamentos,
    private readonly buscarAgendamento: BuscarAgendamento,
    private readonly editarAgendamento: EditarAgendamento,
    private readonly cancelarAgendamento: CancelarAgendamento,
  ) {}

  // ===== CADASTRAR AGENDAMENTO =====
  @Post()
  create(@Body() dto: CreateAgendamentoDto) {
    return this.adicionarAgendamento.executar(dto);
  }

  // ===== LISTAR AGENDAMENTOS =====
  @Get()
  findAll() {
    return this.listarAgendamentos.executar();
  }

  // ===== BUSCAR AGENDAMENTO POR ID =====
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.buscarAgendamento.executar(id);
  }

  // ===== EDITAR AGENDAMENTO =====
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAgendamentoDto,
  ) {
    return this.editarAgendamento.executar(id, dto);
  }

  // ===== CANCELAR AGENDAMENTO =====
  // Mantido como DELETE por consistência de rota com os demais módulos,
  // mas a operação por trás é um cancelamento (muda o status), não uma
  // remoção física — ver CancelarAgendamento e o comentário em schema.prisma.
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.cancelarAgendamento.executar(id);
  }
}
