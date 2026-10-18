import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ClienteJwtAuthGuard } from '../auth-cliente/cliente-jwt-auth.guard';
import { CreateAvaliacaoClienteDto } from './dto/create-avaliacao-cliente.dto';
import { AdicionarAvaliacaoCliente } from './operacoes/adicionar-avaliacao-cliente';

// Rotas de avaliação do cliente logado no app, separadas de /avaliacoes
// (painel, que só aceita administrador). O cliente sempre vem do token.
@UseGuards(ClienteJwtAuthGuard)
@Controller('minhas-avaliacoes')
export class AvaliacoesClienteController {
  constructor(
    private readonly adicionarAvaliacaoCliente: AdicionarAvaliacaoCliente,
  ) {}

  // ===== CADASTRAR AVALIACAO PELO CLIENTE =====
  @Post()
  create(
    @Req() req: { user: { id: number } },
    @Body() dto: CreateAvaliacaoClienteDto,
  ) {
    return this.adicionarAvaliacaoCliente.executar(req.user.id, dto);
  }
}
