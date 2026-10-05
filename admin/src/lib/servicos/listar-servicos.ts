// ===== LISTAR SERVICOS =====
// Ctrl+F "LISTAR SERVICOS" para achar este bloco.
import { apiFetch } from '../api';
import type { Servico } from '@/types/servico';

export function listarServicos() {
  return apiFetch<Servico[]>('/servicos');
}
