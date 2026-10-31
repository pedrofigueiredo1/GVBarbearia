import { IsIn, IsOptional } from 'class-validator';
import { PaginacaoDto } from '../../comum/dto/paginacao.dto';

// Listagem de clientes do painel: busca por nome, e-mail ou telefone, e
// ordenação por uma das colunas da tabela.
export class ListarClientesPaginadoDto extends PaginacaoDto {
  @IsOptional()
  @IsIn(['nome', 'email', 'telefone', 'criadoEm'])
  ordenarPor?: 'nome' | 'email' | 'telefone' | 'criadoEm';
}
