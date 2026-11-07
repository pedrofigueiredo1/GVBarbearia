import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { AdicionarProduto } from './operacoes/adicionar-produto';
import { ListarProdutos } from './operacoes/listar-produtos';
import { BuscarProduto } from './operacoes/buscar-produto';
import { EditarProduto } from './operacoes/editar-produto';
import { ExcluirProduto } from './operacoes/excluir-produto';
import { IdPipe } from '../comum/pipes/id.pipe';
import { RemoverFoto } from '../fotos/operacoes/remover-foto';
import { SalvarFoto } from '../fotos/operacoes/salvar-foto';
import { opcoesDeUploadDeFoto } from '../fotos/upload';

@UseGuards(JwtAuthGuard)
@Controller('produtos')
export class ProdutosController {
  constructor(
    private readonly adicionarProduto: AdicionarProduto,
    private readonly listarProdutos: ListarProdutos,
    private readonly buscarProduto: BuscarProduto,
    private readonly editarProduto: EditarProduto,
    private readonly excluirProduto: ExcluirProduto,
    private readonly salvarFoto: SalvarFoto,
    private readonly removerFoto: RemoverFoto,
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
  findOne(@Param('id', IdPipe) id: number) {
    return this.buscarProduto.executar(id);
  }

  // ===== EDITAR PRODUTO =====
  @Patch(':id')
  update(
    @Param('id', IdPipe) id: number,
    @Body() dto: UpdateProdutoDto,
  ) {
    return this.editarProduto.executar(id, dto);
  }

  // ===== EXCLUIR PRODUTO =====
  @Delete(':id')
  remove(@Param('id', IdPipe) id: number) {
    return this.excluirProduto.executar(id);
  }

  // ===== TROCAR FOTO DO PRODUTO =====
  // Recebe a imagem (campo "foto") e a deixa no formato padrão do app.
  @Put(':id/foto')
  @UseInterceptors(FileInterceptor('foto', opcoesDeUploadDeFoto))
  trocarFoto(
    @Param('id', IdPipe) id: number,
    @UploadedFile() arquivo?: Express.Multer.File,
  ) {
    return this.salvarFoto.executar('produto', id, arquivo?.buffer);
  }

  // ===== REMOVER FOTO DO PRODUTO =====
  @Delete(':id/foto')
  excluirFoto(@Param('id', IdPipe) id: number) {
    return this.removerFoto.executar('produto', id);
  }
}
