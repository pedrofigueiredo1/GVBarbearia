// ===== LOGIN DE CLIENTE =====
// Ctrl+F "LOGIN DE CLIENTE" para achar este bloco.
import { apiFetch } from '../api';
import type { LoginClienteResposta } from '@/types/cliente';

export function loginCliente(email: string, senha: string) {
  return apiFetch<LoginClienteResposta>('/auth/cliente/login', {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  });
}
