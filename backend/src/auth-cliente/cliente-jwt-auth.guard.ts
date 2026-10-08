import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Aplica a estratégia "jwt-cliente" (ClienteJwtStrategy). Usado com
// @UseGuards(ClienteJwtAuthGuard) nas rotas que só o cliente logado no app acessa.
@Injectable()
export class ClienteJwtAuthGuard extends AuthGuard('jwt-cliente') {}
