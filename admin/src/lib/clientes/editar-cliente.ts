// ===== EDITAR CLIENTE =====
// Ctrl+F "EDITAR CLIENTE" para achar este bloco.
import { apiFetch } from '../api';
import type { Cliente, ClienteInput } from '@/types/cliente';

export function editarCliente(id: number, data: ClienteInput) {
  return apiFetch<Cliente>(`/clientes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
