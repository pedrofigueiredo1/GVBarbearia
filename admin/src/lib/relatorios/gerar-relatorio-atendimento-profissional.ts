// ===== GERAR RELATORIO DE ATENDIMENTO POR PROFISSIONAL =====
// Ctrl+F "GERAR RELATORIO DE ATENDIMENTO POR PROFISSIONAL" para achar este bloco.
import { apiFetch } from '../api';
import type { FiltrosRelatorio, RelatorioAtendimentoProfissional } from '@/types/relatorio';
import { montarQuery } from './montar-query';

export function gerarRelatorioAtendimentoProfissional(filtros: FiltrosRelatorio) {
  return apiFetch<RelatorioAtendimentoProfissional>(
    `/relatorios/atendimento-profissional${montarQuery(filtros)}`,
  );
}
