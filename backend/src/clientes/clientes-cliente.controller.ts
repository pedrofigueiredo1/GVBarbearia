import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { ClienteJwtAuthGuard } from '../auth-cliente/cliente-jwt-auth.guard';
import { UpdatePerfilClienteDto } from './dto/update-perfil-cliente.dto';
import { BuscarCliente } from './operacoes/buscar-cliente';
import { EditarPerfilCliente } from './operacoes/editar-perfil-cliente';

// Perfil do cliente logado no app, separado de /clientes (painel, que só
// aceita administrador). Não existe id na URL: o cliente é sempre o do token,
// então ninguém consegue ver nem editar o perfil de outra pessoa por aqui.
@UseGuards(ClienteJwtAuthGuard)
@Controller('meu-perfil')
export class ClientesClienteController {
  constructor(
    private readonly buscarCliente: BuscarCliente,
    private readonly editarPerfilCliente: EditarPerfilCliente,
  ) {}

  // ===== CONSULTAR PERFIL DO CLIENTE =====
  @Get()
  perfil(@Req() req: { user: { id: number } }) {
    return this.buscarCliente.executar(req.user.id);
  }

  // ===== EDITAR PERFIL DO CLIENTE =====
  @Patch()
  editar(
    @Req() req: { user: { id: number } },
    @Body() dto: UpdatePerfilClienteDto,
  ) {
    return this.editarPerfilCliente.executar(req.user.id, dto);
  }
}
