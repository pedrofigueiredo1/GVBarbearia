// ===== GERAR RELATORIO DE AVALIACOES =====
// Ctrl+F "GERAR RELATORIO DE AVALIACOES" para achar este bloco.
import { apiFetch } from '../api';
import type { FiltrosRelatorio, RelatorioAvaliacoes } from '@/types/relatorio';
import { montarQuery } from './montar-query';

export function gerarRelatorioAvaliacoes(filtros: FiltrosRelatorio) {
  return apiFetch<RelatorioAvaliacoes>(`/relatorios/avaliacoes${montarQuery(filtros)}`);
}
