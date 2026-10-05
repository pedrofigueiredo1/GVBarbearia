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
import { CreateProfissionalDto } from './dto/create-profissional.dto';
import { UpdateProfissionalDto } from './dto/update-profissional.dto';
import { AdicionarProfissional } from './operacoes/adicionar-profissional';
import { ListarProfissionais } from './operacoes/listar-profissionais';
import { BuscarProfissional } from './operacoes/buscar-profissional';
import { EditarProfissional } from './operacoes/editar-profissional';
import { ExcluirProfissional } from './operacoes/excluir-profissional';

// Conforme a Regra de Negócio "apenas administradores autenticados podem..."
// presente em todas as US de Profissionais. Cada rota abaixo só chama a
// operação correspondente (pasta ./operacoes) — a lógica de cada uma fica
// em um arquivo próprio, procurável pelo título no comentário (Ctrl+F).
@UseGuards(JwtAuthGuard)
@Controller('profissionais')
export class ProfissionaisController {
  constructor(
    private readonly adicionarProfissional: AdicionarProfissional,
    private readonly listarProfissionais: ListarProfissionais,
    private readonly buscarProfissional: BuscarProfissional,
    private readonly editarProfissional: EditarProfissional,
    private readonly excluirProfissional: ExcluirProfissional,
  ) {}

  // ===== CADASTRAR PROFISSIONAL =====
  @Post()
  create(@Body() dto: CreateProfissionalDto) {
    return this.adicionarProfissional.executar(dto);
  }

  // ===== LISTAR PROFISSIONAIS =====
  @Get()
  findAll() {
    return this.listarProfissionais.executar();
  }

  // ===== BUSCAR PROFISSIONAL POR ID =====
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.buscarProfissional.executar(id);
  }

  // ===== EDITAR PROFISSIONAL =====
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProfissionalDto,
  ) {
    return this.editarProfissional.executar(id, dto);
  }

  // ===== EXCLUIR PROFISSIONAL =====
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.excluirProfissional.executar(id);
  }
}
