import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BuscarCliente } from '../clientes/operacoes/buscar-cliente';
import { ClienteJwtAuthGuard } from './cliente-jwt-auth.guard';
import { LoginClienteDto } from './dto/login-cliente.dto';
import { LoginCliente } from './operacoes/login-cliente';

@Controller('auth/cliente')
export class AuthClienteController {
  constructor(
    private readonly loginCliente: LoginCliente,
    private readonly buscarCliente: BuscarCliente,
  ) {}

  // ===== LOGIN DE CLIENTE =====
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginClienteDto) {
    return this.loginCliente.executar(dto);
  }

  // ===== CLIENTE LOGADO =====
  // Devolve os dados do cliente dono do token — o app usa para confirmar que
  // a sessão salva no celular ainda é válida.
  @UseGuards(ClienteJwtAuthGuard)
  @Get('eu')
  eu(@Req() req: { user: { id: number } }) {
    return this.buscarCliente.executar(req.user.id);
  }
}
