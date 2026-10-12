// ===== LISTAR AVALIACOES =====
// Ctrl+F "LISTAR AVALIACOES" para achar este bloco.
// US "Consulta de Avaliações" (item 2.45): as mais recentes primeiro.
import { apiFetch } from '../api';
import type { AvaliacaoPublica } from '@/types/avaliacao';

export function listarAvaliacoes() {
  return apiFetch<AvaliacaoPublica[]>('/publico/avaliacoes');
}
