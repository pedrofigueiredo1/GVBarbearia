// ===== GERAR RELATORIO DE SERVICOS MAIS AGENDADOS =====
// Ctrl+F "GERAR RELATORIO DE SERVICOS MAIS AGENDADOS" para achar este bloco.
import { apiFetch } from '../api';
import type { FiltrosRelatorio, ServicoMaisAgendado } from '@/types/relatorio';
import { montarQuery } from './montar-query';

export function gerarRelatorioServicosMaisAgendados(filtros: FiltrosRelatorio) {
  return apiFetch<ServicoMaisAgendado[]>(
    `/relatorios/servicos-mais-agendados${montarQuery(filtros)}`,
  );
}
