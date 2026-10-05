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
import { CreateServicoDto } from './dto/create-servico.dto';
import { UpdateServicoDto } from './dto/update-servico.dto';
import { AdicionarServico } from './operacoes/adicionar-servico';
import { ListarServicos } from './operacoes/listar-servicos';
import { BuscarServico } from './operacoes/buscar-servico';
import { EditarServico } from './operacoes/editar-servico';
import { ExcluirServico } from './operacoes/excluir-servico';

@UseGuards(JwtAuthGuard)
@Controller('servicos')
export class ServicosController {
  constructor(
    private readonly adicionarServico: AdicionarServico,
    private readonly listarServicos: ListarServicos,
    private readonly buscarServico: BuscarServico,
    private readonly editarServico: EditarServico,
    private readonly excluirServico: ExcluirServico,
  ) {}

  // ===== CADASTRAR SERVICO =====
  @Post()
  create(@Body() dto: CreateServicoDto) {
    return this.adicionarServico.executar(dto);
  }

  // ===== LISTAR SERVICOS =====
  @Get()
  findAll() {
    return this.listarServicos.executar();
  }

  // ===== BUSCAR SERVICO POR ID =====
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.buscarServico.executar(id);
  }

  // ===== EDITAR SERVICO =====
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateServicoDto,
  ) {
    return this.editarServico.executar(id, dto);
  }

  // ===== EXCLUIR SERVICO =====
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.excluirServico.executar(id);
  }
}
