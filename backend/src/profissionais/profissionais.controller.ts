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
import { CreateProfissionalDto } from './dto/create-profissional.dto';
import { UpdateProfissionalDto } from './dto/update-profissional.dto';
import { AdicionarProfissional } from './operacoes/adicionar-profissional';
import { ListarProfissionais } from './operacoes/listar-profissionais';
import { BuscarProfissional } from './operacoes/buscar-profissional';
import { EditarProfissional } from './operacoes/editar-profissional';
import { ExcluirProfissional } from './operacoes/excluir-profissional';
import { IdPipe } from '../comum/pipes/id.pipe';
import { RemoverFoto } from '../fotos/operacoes/remover-foto';
import { SalvarFoto } from '../fotos/operacoes/salvar-foto';
import { opcoesDeUploadDeFoto } from '../fotos/upload';

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
    private readonly salvarFoto: SalvarFoto,
    private readonly removerFoto: RemoverFoto,
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
  findOne(@Param('id', IdPipe) id: number) {
    return this.buscarProfissional.executar(id);
  }

  // ===== EDITAR PROFISSIONAL =====
  @Patch(':id')
  update(
    @Param('id', IdPipe) id: number,
    @Body() dto: UpdateProfissionalDto,
  ) {
    return this.editarProfissional.executar(id, dto);
  }

  // ===== EXCLUIR PROFISSIONAL =====
  @Delete(':id')
  remove(@Param('id', IdPipe) id: number) {
    return this.excluirProfissional.executar(id);
  }

  // ===== TROCAR FOTO DO PROFISSIONAL =====
  // Recebe a imagem (campo "foto") e a deixa no formato padrão do app.
  @Put(':id/foto')
  @UseInterceptors(FileInterceptor('foto', opcoesDeUploadDeFoto))
  trocarFoto(
    @Param('id', IdPipe) id: number,
    @UploadedFile() arquivo?: Express.Multer.File,
  ) {
    return this.salvarFoto.executar('profissional', id, arquivo?.buffer);
  }

  // ===== REMOVER FOTO DO PROFISSIONAL =====
  @Delete(':id/foto')
  excluirFoto(@Param('id', IdPipe) id: number) {
    return this.removerFoto.executar('profissional', id);
  }
}
