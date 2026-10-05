import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateAvaliacaoDto } from './dto/update-avaliacao.dto';
import { ListarAvaliacoes } from './operacoes/listar-avaliacoes';
import { BuscarAvaliacao } from './operacoes/buscar-avaliacao';
import { EditarAvaliacao } from './operacoes/editar-avaliacao';
import { ExcluirAvaliacao } from './operacoes/excluir-avaliacao';

// Sem rota de criação: o Cadastro de Avaliação é feito pelo próprio cliente
// no app (fase posterior). Aqui só entram as US do painel administrativo.
@UseGuards(JwtAuthGuard)
@Controller('avaliacoes')
export class AvaliacoesController {
  constructor(
    private readonly listarAvaliacoes: ListarAvaliacoes,
    private readonly buscarAvaliacao: BuscarAvaliacao,
    private readonly editarAvaliacao: EditarAvaliacao,
    private readonly excluirAvaliacao: ExcluirAvaliacao,
  ) {}

  // ===== LISTAR AVALIACOES =====
  @Get()
  findAll() {
    return this.listarAvaliacoes.executar();
  }

  // ===== BUSCAR AVALIACAO POR ID =====
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.buscarAvaliacao.executar(id);
  }

  // ===== EDITAR AVALIACAO =====
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAvaliacaoDto,
  ) {
    return this.editarAvaliacao.executar(id, dto);
  }

  // ===== EXCLUIR AVALIACAO =====
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.excluirAvaliacao.executar(id);
  }
}
