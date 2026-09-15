import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Aplica a estratégia "jwt" registrada em JwtStrategy. Usado com
// @UseGuards(JwtAuthGuard) em todo controller que exige administrador
// autenticado — o que, segundo a documentação, é praticamente todos.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
