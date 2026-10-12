// ===== CONSULTAR CLIENTE LOGADO =====
// Ctrl+F "CONSULTAR CLIENTE LOGADO" para achar este bloco.
// Também serve para confirmar que a sessão salva no celular ainda é válida:
// se o token expirou, o apiFetch limpa a sessão e o app volta ao login.
import { apiFetch } from '../api';
import type { ClienteLogado } from '@/types/cliente';

export function consultarClienteLogado() {
  return apiFetch<ClienteLogado>('/auth/cliente/eu');
}
