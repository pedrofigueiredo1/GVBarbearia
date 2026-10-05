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
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { AdicionarCliente } from './operacoes/adicionar-cliente';
import { ListarClientes } from './operacoes/listar-clientes';
import { BuscarCliente } from './operacoes/buscar-cliente';
import { EditarCliente } from './operacoes/editar-cliente';
import { ExcluirCliente } from './operacoes/excluir-cliente';

// A criação de cliente pelo admin não está nas US originais (que só previam
// o cliente se cadastrando pelo app) — é um caso de uso real confirmado com
// Pedro: atender presencialmente quem prefere não usar o app.
@UseGuards(JwtAuthGuard)
@Controller('clientes')
export class ClientesController {
  constructor(
    private readonly adicionarCliente: AdicionarCliente,
    private readonly listarClientes: ListarClientes,
    private readonly buscarCliente: BuscarCliente,
    private readonly editarCliente: EditarCliente,
    private readonly excluirCliente: ExcluirCliente,
  ) {}

  // ===== CADASTRAR CLIENTE =====
  @Post()
  create(@Body() dto: CreateClienteDto) {
    return this.adicionarCliente.executar(dto);
  }

  // ===== LISTAR CLIENTES =====
  @Get()
  findAll() {
    return this.listarClientes.executar();
  }

  // ===== BUSCAR CLIENTE POR ID =====
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.buscarCliente.executar(id);
  }

  // ===== EDITAR CLIENTE =====
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClienteDto,
  ) {
    return this.editarCliente.executar(id, dto);
  }

  // ===== EXCLUIR CLIENTE =====
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.excluirCliente.executar(id);
  }
}
