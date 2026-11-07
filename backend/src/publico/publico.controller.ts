import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
  StreamableFile,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CreateClienteDto } from '../clientes/dto/create-cliente.dto';
import { AdicionarCliente } from '../clientes/operacoes/adicionar-cliente';
import { ConsultarBarbearia } from '../barbearia/operacoes/consultar-barbearia';
import { ListarProfissionais } from '../profissionais/operacoes/listar-profissionais';
import { ListarProdutos } from '../produtos/operacoes/listar-produtos';
import { ListarAvaliacoesPublicas } from './operacoes/listar-avaliacoes-publicas';
import { IdPipe } from '../comum/pipes/id.pipe';
import { ConsultarFoto } from '../fotos/operacoes/consultar-foto';
import { ListarServicosComRanking } from './operacoes/listar-servicos-com-ranking';

// Rotas abertas ao app do cliente, sem login: cadastro e consultas de
// informações da barbearia, serviços, profissionais, produtos e avaliações.
// As rotas equivalentes do painel (src/clientes, src/servicos...) continuam
// protegidas e só aceitam token de administrador.
@Controller('publico')
export class PublicoController {
  constructor(
    private readonly adicionarCliente: AdicionarCliente,
    private readonly consultarBarbearia: ConsultarBarbearia,
    private readonly listarServicosComRanking: ListarServicosComRanking,
    private readonly listarProfissionais: ListarProfissionais,
    private readonly listarProdutos: ListarProdutos,
    private readonly listarAvaliacoesPublicas: ListarAvaliacoesPublicas,
    private readonly consultarFoto: ConsultarFoto,
  ) {}

  // ===== CADASTRO DE CLIENTE PELO APP =====
  // US "Cadastro de Cliente" (item 2.37): usa a mesma operação do cadastro
  // feito pelo administrador (e-mail duplicado já vira 409).
  // Cadastro aberto a qualquer um: limitado a 10 contas por hora por IP.
  @Throttle({ default: { limit: 10, ttl: 3_600_000 } })
  @Post('clientes')
  cadastrarCliente(@Body() dto: CreateClienteDto) {
    return this.adicionarCliente.executar(dto);
  }

  // ===== CONSULTAR BARBEARIA (PUBLICO) =====
  // US "Consulta de Informações da Barbearia" do cliente (item 2.41). Sem
  // cadastro, a resposta vem vazia e o app mostra "sem informações".
  @Get('barbearia')
  barbearia() {
    return this.consultarBarbearia.executar();
  }

  // ===== LISTAR SERVICOS (PUBLICO) =====
  // Cada serviço vem com o total de agendamentos e a marca `emDestaque` do
  // mais agendado (ver listar-servicos-com-ranking.ts).
  @Get('servicos')
  servicos() {
    return this.listarServicosComRanking.executar();
  }

  // ===== LISTAR PROFISSIONAIS (PUBLICO) =====
  @Get('profissionais')
  profissionais() {
    return this.listarProfissionais.executar();
  }

  // ===== LISTAR PRODUTOS (PUBLICO) =====
  @Get('produtos')
  produtos() {
    return this.listarProdutos.executar();
  }

  // ===== LISTAR AVALIACOES (PUBLICO) =====
  @Get('avaliacoes')
  avaliacoes() {
    return this.listarAvaliacoesPublicas.executar();
  }

  // ===== FOTO DO PROFISSIONAL (PUBLICO) =====
  // O endereço leva `?v=<data da foto>` (campo fotoAtualizadaEm), que muda a
  // cada troca; por isso o navegador e o app podem guardar a imagem por muito
  // tempo sem mostrar uma foto velha.
  @Get('profissionais/:id/foto')
  @Header('Cache-Control', 'public, max-age=31536000, immutable')
  async fotoDoProfissional(@Param('id', IdPipe) id: number) {
    const foto = await this.consultarFoto.executar('profissional', id);
    return new StreamableFile(foto.conteudo, { type: foto.tipoMime });
  }

  // ===== FOTO DO PRODUTO (PUBLICO) =====
  @Get('produtos/:id/foto')
  @Header('Cache-Control', 'public, max-age=31536000, immutable')
  async fotoDoProduto(@Param('id', IdPipe) id: number) {
    const foto = await this.consultarFoto.executar('produto', id);
    return new StreamableFile(foto.conteudo, { type: foto.tipoMime });
  }
}
