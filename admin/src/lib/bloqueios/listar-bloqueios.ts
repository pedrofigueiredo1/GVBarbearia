// ===== LISTAR BLOQUEIOS DE AGENDA =====
// Ctrl+F "LISTAR BLOQUEIOS DE AGENDA" para achar este bloco.
// Bloqueios em andamento ou futuros.
import { apiFetch } from '../api';
import type { BloqueioAgenda } from '@/types/bloqueio';

export function listarBloqueios() {
  return apiFetch<BloqueioAgenda[]>('/bloqueios-agenda');
}
