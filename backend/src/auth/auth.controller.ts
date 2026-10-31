import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SolicitarRecuperacaoSenhaDto } from './dto/solicitar-recuperacao-senha.dto';
import { RedefinirSenhaDto } from './dto/redefinir-senha.dto';
import { SolicitarRecuperacaoSenha } from './operacoes/solicitar-recuperacao-senha';
import { RedefinirSenha } from './operacoes/redefinir-senha';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly solicitarRecuperacaoSenha: SolicitarRecuperacaoSenha,
    private readonly redefinirSenha: RedefinirSenha,
  ) {}

  // Contra tentativa de adivinhar a senha: 5 tentativas por minuto por IP.
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // ===== SOLICITAR RECUPERACAO DE SENHA =====
  // 3 pedidos a cada 15 minutos por IP, para ninguém inundar uma caixa de e-mail.
  @Throttle({ default: { limit: 3, ttl: 900_000 } })
  @Post('esqueci-senha')
  @HttpCode(HttpStatus.OK)
  esqueciSenha(@Body() dto: SolicitarRecuperacaoSenhaDto) {
    return this.solicitarRecuperacaoSenha.executar(dto);
  }

  // ===== REDEFINIR SENHA =====
  @Throttle({ default: { limit: 10, ttl: 900_000 } })
  @Post('redefinir-senha')
  @HttpCode(HttpStatus.OK)
  redefinir(@Body() dto: RedefinirSenhaDto) {
    return this.redefinirSenha.executar(dto);
  }
}
