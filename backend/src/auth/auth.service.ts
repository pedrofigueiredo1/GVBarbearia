import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login({ login, senha }: LoginDto) {
    const administrador = await this.prisma.administrador.findUnique({
      where: { login },
    });

    // Mensagem genérica de propósito: não revela se o problema foi o login
    // ou a senha (CT02 da US Login de Administrador só exige "mostrar erro",
    // mas seguir o mesmo cuidado das US de recuperação de senha é boa prática).
    const senhaValida =
      administrador && (await bcrypt.compare(senha, administrador.senha));

    if (!administrador || !senhaValida) {
      throw new UnauthorizedException('Login ou senha inválidos.');
    }

    const payload = { sub: administrador.id, login: administrador.login };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      administrador: {
        id: administrador.id,
        nome: administrador.nome,
        login: administrador.login,
      },
    };
  }
}
