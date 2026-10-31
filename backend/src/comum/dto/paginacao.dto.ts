import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

// Parâmetros comuns das listagens paginadas do painel. Chegam na URL, por isso
// `@Type(() => Number)` converte o texto em número antes da validação.
export class PaginacaoDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pagina?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limite?: number;

  // Texto digitado na busca da tela.
  @IsOptional()
  @IsString()
  @MaxLength(100)
  busca?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  direcao?: 'asc' | 'desc';
}

export const LIMITE_PADRAO = 10;

// Resposta padrão das listagens paginadas.
export interface Pagina<T> {
  itens: T[];
  total: number;
  pagina: number;
  limite: number;
}

// Número da página e quantos itens pular, com os valores padrão aplicados.
export function paginar(dto: PaginacaoDto) {
  const pagina = dto.pagina ?? 1;
  const limite = dto.limite ?? LIMITE_PADRAO;
  return { pagina, limite, skip: (pagina - 1) * limite, take: limite };
}
