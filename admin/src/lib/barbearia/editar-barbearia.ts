// ===== EDITAR BARBEARIA =====
// Ctrl+F "EDITAR BARBEARIA" para achar este bloco.
import { apiFetch } from '../api';
import type { Barbearia, BarbeariaInput } from '@/types/barbearia';

export function salvarBarbearia(data: BarbeariaInput) {
  return apiFetch<Barbearia>('/barbearia', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
