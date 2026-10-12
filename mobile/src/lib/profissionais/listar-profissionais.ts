// ===== LISTAR PROFISSIONAIS =====
// Ctrl+F "LISTAR PROFISSIONAIS" para achar este bloco.
// US "Consulta de Profissionais" (item 2.43).
import { apiFetch } from '../api';
import type { Profissional } from '@/types/profissional';

export function listarProfissionais() {
  return apiFetch<Profissional[]>('/publico/profissionais');
}
