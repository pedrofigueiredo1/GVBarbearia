// ===== GERAR RELATORIO DE AGENDAMENTOS =====
// Ctrl+F "GERAR RELATORIO DE AGENDAMENTOS" para achar este bloco.
import { apiFetch } from '../api';
import type { FiltrosRelatorio, RelatorioAgendamentos } from '@/types/relatorio';
import { montarQuery } from './montar-query';

export function gerarRelatorioAgendamentos(filtros: FiltrosRelatorio) {
  return apiFetch<RelatorioAgendamentos>(`/relatorios/agendamentos${montarQuery(filtros)}`);
}
