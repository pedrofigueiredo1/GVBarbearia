import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

interface ClienteJwtPayload {
  sub: number;
  email: string;
}

// Valida o token do cliente (header "Authorization: Bearer <token>") com o
// segredo CLIENTE_JWT_SECRET, diferente do segredo do administrador: por isso
// um token de administrador nunca passa aqui, e o de cliente nunca passa nas
// rotas do painel. O retorno de validate() vira `request.user`.
@Injectable()
export class ClienteJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-cliente',
) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('CLIENTE_JWT_SECRET'),
    });
  }

  // O token dura vários dias; se o administrador excluir o cliente nesse
  // intervalo, o token antigo deixa de valer.
  async validate(payload: ClienteJwtPayload) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true },
    });

    if (!cliente) {
      throw new UnauthorizedException();
    }

    return cliente;
  }
}
