import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IdPipe } from '../comum/pipes/id.pipe';
import { CreateBloqueioAgendaDto } from './dto/create-bloqueio-agenda.dto';
import { AdicionarBloqueioAgenda } from './operacoes/adicionar-bloqueio-agenda';
import { ExcluirBloqueioAgenda } from './operacoes/excluir-bloqueio-agenda';
import { ListarBloqueiosAgenda } from './operacoes/listar-bloqueios-agenda';

// Bloqueios de agenda do painel (feriados e ausências de barbeiros).
@UseGuards(JwtAuthGuard)
@Controller('bloqueios-agenda')
export class BloqueiosAgendaController {
  constructor(
    private readonly adicionarBloqueioAgenda: AdicionarBloqueioAgenda,
    private readonly listarBloqueiosAgenda: ListarBloqueiosAgenda,
    private readonly excluirBloqueioAgenda: ExcluirBloqueioAgenda,
  ) {}

  // ===== CADASTRAR BLOQUEIO DE AGENDA =====
  @Post()
  create(@Body() dto: CreateBloqueioAgendaDto) {
    return this.adicionarBloqueioAgenda.executar(dto);
  }

  // ===== LISTAR BLOQUEIOS DE AGENDA =====
  @Get()
  findAll() {
    return this.listarBloqueiosAgenda.executar();
  }

  // ===== EXCLUIR BLOQUEIO DE AGENDA =====
  @Delete(':id')
  remove(@Param('id', IdPipe) id: number) {
    return this.excluirBloqueioAgenda.executar(id);
  }
}
