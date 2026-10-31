import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateAgendamentoDto } from './dto/create-agendamento.dto';
import { FiltrosAgendamentoDto } from './dto/filtros-agendamento.dto';
import { ListarAgendamentosPaginadoDto } from './dto/listar-agendamentos-paginado.dto';
import { UpdateAgendamentoDto } from './dto/update-agendamento.dto';
import { AdicionarAgendamento } from './operacoes/adicionar-agendamento';
import { ListarAgendamentos } from './operacoes/listar-agendamentos';
import { ListarAgendamentosPaginado } from './operacoes/listar-agendamentos-paginado';
import { BuscarAgendamento } from './operacoes/buscar-agendamento';
import { EditarAgendamento } from './operacoes/editar-agendamento';
import { CancelarAgendamento } from './operacoes/cancelar-agendamento';
import { IdPipe } from '../comum/pipes/id.pipe';

@UseGuards(JwtAuthGuard)
@Controller('agendamentos')
export class AgendamentosController {
  constructor(
    private readonly adicionarAgendamento: AdicionarAgendamento,
    private readonly listarAgendamentos: ListarAgendamentos,
    private readonly listarAgendamentosPaginado: ListarAgendamentosPaginado,
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
  findAll(@Query() filtros: FiltrosAgendamentoDto) {
    return this.listarAgendamentos.executar(filtros);
  }

  // ===== LISTAR AGENDAMENTOS PAGINADO =====
  // Declarada antes de ':id' para 'paginado' não ser lido como um id.
  @Get('paginado')
  findPage(@Query() dto: ListarAgendamentosPaginadoDto) {
    return this.listarAgendamentosPaginado.executar(dto);
  }

  // ===== BUSCAR AGENDAMENTO POR ID =====
  @Get(':id')
  findOne(@Param('id', IdPipe) id: number) {
    return this.buscarAgendamento.executar(id);
  }

  // ===== EDITAR AGENDAMENTO =====
  @Patch(':id')
  update(@Param('id', IdPipe) id: number, @Body() dto: UpdateAgendamentoDto) {
    return this.editarAgendamento.executar(id, dto);
  }

  // ===== CANCELAR AGENDAMENTO =====
  // Mantido como DELETE por consistência de rota com os demais módulos,
  // mas a operação por trás é um cancelamento (muda o status), não uma
  // remoção física — ver CancelarAgendamento e o comentário em schema.prisma.
  @Delete(':id')
  remove(@Param('id', IdPipe) id: number) {
    return this.cancelarAgendamento.executar(id);
  }
}
