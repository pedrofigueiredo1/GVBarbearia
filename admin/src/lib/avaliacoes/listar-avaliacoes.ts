// ===== LISTAR AVALIACOES =====
// Ctrl+F "LISTAR AVALIACOES" para achar este bloco.
import { apiFetch } from '../api';
import type { Avaliacao } from '@/types/avaliacao';

export function listarAvaliacoes() {
  return apiFetch<Avaliacao[]>('/avaliacoes');
}
