// ===== LISTAR CLIENTES PAGINADO =====
// Ctrl+F "LISTAR CLIENTES PAGINADO" para achar este bloco.
// Uma página de clientes por vez, com busca e ordenação feitas no servidor.
import { apiFetch } from '../api';
import { montarQuery } from '../relatorios/montar-query';
import type { ParametrosPagina } from '@/hooks/useTabelaServidor';
import type { Cliente } from '@/types/cliente';
import type { Pagina } from '@/types/tabela';

export function listarClientesPaginado(parametros: ParametrosPagina) {
  return apiFetch<Pagina<Cliente>>(`/clientes/paginado${montarQuery(parametros)}`);
}
