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
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { AdicionarProduto } from './operacoes/adicionar-produto';
import { ListarProdutos } from './operacoes/listar-produtos';
import { BuscarProduto } from './operacoes/buscar-produto';
import { EditarProduto } from './operacoes/editar-produto';
import { ExcluirProduto } from './operacoes/excluir-produto';

@UseGuards(JwtAuthGuard)
@Controller('produtos')
export class ProdutosController {
  constructor(
    private readonly adicionarProduto: AdicionarProduto,
    private readonly listarProdutos: ListarProdutos,
    private readonly buscarProduto: BuscarProduto,
    private readonly editarProduto: EditarProduto,
    private readonly excluirProduto: ExcluirProduto,
  ) {}

  // ===== CADASTRAR PRODUTO =====
  @Post()
  create(@Body() dto: CreateProdutoDto) {
    return this.adicionarProduto.executar(dto);
  }

  // ===== LISTAR PRODUTOS =====
  @Get()
  findAll() {
    return this.listarProdutos.executar();
  }

  // ===== BUSCAR PRODUTO POR ID =====
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.buscarProduto.executar(id);
  }

  // ===== EDITAR PRODUTO =====
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProdutoDto,
  ) {
    return this.editarProduto.executar(id, dto);
  }

  // ===== EXCLUIR PRODUTO =====
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.excluirProduto.executar(id);
  }
}
