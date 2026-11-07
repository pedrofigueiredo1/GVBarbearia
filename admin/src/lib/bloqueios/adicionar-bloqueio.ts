// ===== ADICIONAR BLOQUEIO DE AGENDA =====
// Ctrl+F "ADICIONAR BLOQUEIO DE AGENDA" para achar este bloco.
import { apiFetch } from '../api';
import type { BloqueioAgendaCadastrado, BloqueioAgendaInput } from '@/types/bloqueio';

export function criarBloqueio(data: BloqueioAgendaInput) {
  return apiFetch<BloqueioAgendaCadastrado>('/bloqueios-agenda', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
