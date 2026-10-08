// ===== LOGIN DE CLIENTE =====
// Ctrl+F "LOGIN DE CLIENTE" para achar este bloco.
// US "Login de Cliente" (item 2.38 da documentação): só cliente já cadastrado
// entra, e credenciais erradas nunca liberam acesso (CT02). A mensagem de erro
// é a mesma para e-mail inexistente e senha errada, para não revelar quais
// e-mails estão cadastrados.
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginClienteDto } from '../dto/login-cliente.dto';

@Injectable()
export class LoginCliente {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async executar({ email, senha }: LoginClienteDto) {
    const cliente = await this.prisma.cliente.findUnique({ where: { email } });

    const senhaValida = cliente && (await bcrypt.compare(senha, cliente.senha));

    if (!cliente || !senhaValida) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    return {
      accessToken: await this.jwtService.signAsync({
        sub: cliente.id,
        email: cliente.email,
      }),
      cliente: { id: cliente.id, nome: cliente.nome, email: cliente.email },
    };
  }
}
