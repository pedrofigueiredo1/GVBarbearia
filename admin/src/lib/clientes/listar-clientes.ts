// ===== LISTAR CLIENTES =====
// Ctrl+F "LISTAR CLIENTES" para achar este bloco.
import { apiFetch } from '../api';
import type { Cliente } from '@/types/cliente';

export function listarClientes() {
  return apiFetch<Cliente[]>('/clientes');
}
