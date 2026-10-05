// ===== LISTAR PROFISSIONAIS =====
// Ctrl+F "LISTAR PROFISSIONAIS" para achar este bloco.
import { apiFetch } from '../api';
import type { Profissional } from '@/types/profissional';

export function listarProfissionais() {
  return apiFetch<Profissional[]>('/profissionais');
}
