import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
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

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // ===== SOLICITAR RECUPERACAO DE SENHA =====
  @Post('esqueci-senha')
  @HttpCode(HttpStatus.OK)
  esqueciSenha(@Body() dto: SolicitarRecuperacaoSenhaDto) {
    return this.solicitarRecuperacaoSenha.executar(dto);
  }

  // ===== REDEFINIR SENHA =====
  @Post('redefinir-senha')
  @HttpCode(HttpStatus.OK)
  redefinir(@Body() dto: RedefinirSenhaDto) {
    return this.redefinirSenha.executar(dto);
  }
}
