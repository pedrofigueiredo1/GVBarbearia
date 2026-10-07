// ===== GERAR RELATORIO DE CLIENTES =====
// Ctrl+F "GERAR RELATORIO DE CLIENTES" para achar este bloco.
import { apiFetch } from '../api';
import type { FiltrosRelatorio, RelatorioClientes } from '@/types/relatorio';
import { montarQuery } from './montar-query';

export function gerarRelatorioClientes(filtros: FiltrosRelatorio) {
  return apiFetch<RelatorioClientes>(`/relatorios/clientes${montarQuery(filtros)}`);
}
