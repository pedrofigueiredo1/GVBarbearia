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
import { CreateAdministradorDto } from './dto/create-administrador.dto';
import { UpdateAdministradorDto } from './dto/update-administrador.dto';
import { AdicionarAdministrador } from './operacoes/adicionar-administrador';
import { ListarAdministradores } from './operacoes/listar-administradores';
import { BuscarAdministrador } from './operacoes/buscar-administrador';
import { EditarAdministrador } from './operacoes/editar-administrador';
import { ExcluirAdministrador } from './operacoes/excluir-administrador';

// Todas as rotas exigem administrador autenticado, conforme as Regras de
// Negócio de cada US (Cadastro/Consulta/Edição/Exclusão de Administrador).
@UseGuards(JwtAuthGuard)
@Controller('administradores')
export class AdministradoresController {
  constructor(
    private readonly adicionarAdministrador: AdicionarAdministrador,
    private readonly listarAdministradores: ListarAdministradores,
    private readonly buscarAdministrador: BuscarAdministrador,
    private readonly editarAdministrador: EditarAdministrador,
    private readonly excluirAdministrador: ExcluirAdministrador,
  ) {}

  // ===== CADASTRAR ADMINISTRADOR =====
  @Post()
  create(@Body() dto: CreateAdministradorDto) {
    return this.adicionarAdministrador.executar(dto);
  }

  // ===== LISTAR ADMINISTRADORES =====
  @Get()
  findAll() {
    return this.listarAdministradores.executar();
  }

  // ===== BUSCAR ADMINISTRADOR POR ID =====
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.buscarAdministrador.executar(id);
  }

  // ===== EDITAR ADMINISTRADOR =====
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdministradorDto,
  ) {
    return this.editarAdministrador.executar(id, dto);
  }

  // ===== EXCLUIR ADMINISTRADOR =====
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.excluirAdministrador.executar(id);
  }
}
