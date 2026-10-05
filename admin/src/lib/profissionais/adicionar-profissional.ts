// ===== ADICIONAR PROFISSIONAL =====
// Ctrl+F "ADICIONAR PROFISSIONAL" para achar este bloco.
import { apiFetch } from '../api';
import type { Profissional, ProfissionalInput } from '@/types/profissional';

export function criarProfissional(data: ProfissionalInput) {
  return apiFetch<Profissional>('/profissionais', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
