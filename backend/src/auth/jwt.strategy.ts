import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

interface JwtPayload {
  sub: number;
  login: string;
}

// Valida o token enviado no header "Authorization: Bearer <token>" em toda
// rota protegida por JwtAuthGuard. O retorno de validate() fica disponível
// como `request.user` nos controllers.
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  // O token dura 8 horas; se o administrador for excluído nesse intervalo, o
  // token antigo deixa de valer (mesma proteção do token do cliente).
  async validate(payload: JwtPayload) {
    const administrador = await this.prisma.administrador.findUnique({
      where: { id: payload.sub },
      select: { id: true, login: true },
    });

    if (!administrador) {
      throw new UnauthorizedException();
    }

    return administrador;
  }
}
