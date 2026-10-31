import type { ReactNode } from 'react';

// Coluna de uma tabela do painel. `valor` é o que se usa para ordenar quando a
// ordenação é feita no navegador; nas tabelas paginadas pelo servidor, `chave`
// é enviada para a API como `ordenarPor`.
export interface Coluna<T> {
  chave: string;
  titulo: string;
  render: (item: T) => ReactNode;
  ordenavel?: boolean;
  valor?: (item: T) => string | number;
  className?: string;
}

export interface Ordenacao {
  chave: string;
  direcao: 'asc' | 'desc';
}

// Resposta das listagens paginadas pelo servidor.
export interface Pagina<T> {
  itens: T[];
  total: number;
  pagina: number;
  limite: number;
}
