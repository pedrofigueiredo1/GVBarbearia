import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateClienteDto } from '../clientes/dto/create-cliente.dto';
import { AdicionarCliente } from '../clientes/operacoes/adicionar-cliente';
import { ConsultarBarbearia } from '../barbearia/operacoes/consultar-barbearia';
import { ListarServicos } from '../servicos/operacoes/listar-servicos';
import { ListarProfissionais } from '../profissionais/operacoes/listar-profissionais';
import { ListarProdutos } from '../produtos/operacoes/listar-produtos';
import { ListarAvaliacoesPublicas } from './operacoes/listar-avaliacoes-publicas';

// Rotas abertas ao app do cliente, sem login: cadastro e consultas de
// informações da barbearia, serviços, profissionais, produtos e avaliações.
// As rotas equivalentes do painel (src/clientes, src/servicos...) continuam
// protegidas e só aceitam token de administrador.
@Controller('publico')
export class PublicoController {
  constructor(
    private readonly adicionarCliente: AdicionarCliente,
    private readonly consultarBarbearia: ConsultarBarbearia,
    private readonly listarServicos: ListarServicos,
    private readonly listarProfissionais: ListarProfissionais,
    private readonly listarProdutos: ListarProdutos,
    private readonly listarAvaliacoesPublicas: ListarAvaliacoesPublicas,
  ) {}

  // ===== CADASTRO DE CLIENTE PELO APP =====
  // US "Cadastro de Cliente" (item 2.37): usa a mesma operação do cadastro
  // feito pelo administrador (e-mail duplicado já vira 409).
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
  @Get('servicos')
  servicos() {
    return this.listarServicos.executar();
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
}
