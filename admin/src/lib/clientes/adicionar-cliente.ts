// ===== ADICIONAR CLIENTE =====
// Ctrl+F "ADICIONAR CLIENTE" para achar este bloco.
import { apiFetch } from '../api';
import type { Cliente, ClienteInput } from '@/types/cliente';

export function criarCliente(data: Required<ClienteInput>) {
  return apiFetch<Cliente>('/clientes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
