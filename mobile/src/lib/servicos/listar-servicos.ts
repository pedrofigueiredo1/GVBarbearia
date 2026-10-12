// ===== LISTAR SERVICOS =====
// Ctrl+F "LISTAR SERVICOS" para achar este bloco.
// US "Consulta de Serviços" (item 2.42).
import { apiFetch } from '../api';
import type { Servico } from '@/types/servico';

export function listarServicos() {
  return apiFetch<Servico[]>('/publico/servicos');
}
