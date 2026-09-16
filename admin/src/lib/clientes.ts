import { apiFetch } from './api';
import type { Cliente, ClienteInput } from '@/types/cliente';

export function listarClientes() {
  return apiFetch<Cliente[]>('/clientes');
}

export function criarCliente(data: Required<ClienteInput>) {
  return apiFetch<Cliente>('/clientes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function editarCliente(id: number, data: ClienteInput) {
  return apiFetch<Cliente>(`/clientes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function excluirCliente(id: number) {
  return apiFetch<void>(`/clientes/${id}`, { method: 'DELETE' });
}
