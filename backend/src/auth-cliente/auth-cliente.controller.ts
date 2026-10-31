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
import { Throttle } from '@nestjs/throttler';
import { BuscarCliente } from '../clientes/operacoes/buscar-cliente';
import { ClienteJwtAuthGuard } from './cliente-jwt-auth.guard';
import { LoginClienteDto } from './dto/login-cliente.dto';
import { RedefinirSenhaClienteDto } from './dto/redefinir-senha-cliente.dto';
import { SolicitarRecuperacaoSenhaClienteDto } from './dto/solicitar-recuperacao-senha-cliente.dto';
import { LoginCliente } from './operacoes/login-cliente';
import { RedefinirSenhaCliente } from './operacoes/redefinir-senha-cliente';
import { SolicitarRecuperacaoSenhaCliente } from './operacoes/solicitar-recuperacao-senha-cliente';

@Controller('auth/cliente')
export class AuthClienteController {
  constructor(
    private readonly loginCliente: LoginCliente,
    private readonly buscarCliente: BuscarCliente,
    private readonly solicitarRecuperacaoSenha: SolicitarRecuperacaoSenhaCliente,
    private readonly redefinirSenha: RedefinirSenhaCliente,
  ) {}

  // ===== LOGIN DE CLIENTE =====
  // Contra tentativa de adivinhar a senha: 5 tentativas por minuto por IP.
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
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

  // ===== SOLICITAR RECUPERACAO DE SENHA DO CLIENTE =====
  // 3 pedidos a cada 15 minutos por IP, para ninguém inundar uma caixa de e-mail.
  @Throttle({ default: { limit: 3, ttl: 900_000 } })
  @Post('esqueci-senha')
  @HttpCode(HttpStatus.OK)
  esqueciSenha(@Body() dto: SolicitarRecuperacaoSenhaClienteDto) {
    return this.solicitarRecuperacaoSenha.executar(dto);
  }

  // ===== REDEFINIR SENHA DO CLIENTE =====
  @Throttle({ default: { limit: 10, ttl: 900_000 } })
  @Post('redefinir-senha')
  @HttpCode(HttpStatus.OK)
  redefinir(@Body() dto: RedefinirSenhaClienteDto) {
    return this.redefinirSenha.executar(dto);
  }
}
