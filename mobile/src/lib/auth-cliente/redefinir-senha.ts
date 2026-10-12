// ===== REDEFINIR SENHA =====
// Ctrl+F "REDEFINIR SENHA" para achar este bloco.
import { apiFetch } from '../api';
import type { MensagemResposta } from '@/types/cliente';

export function redefinirSenha(email: string, codigo: string, novaSenha: string) {
  return apiFetch<MensagemResposta>('/auth/cliente/redefinir-senha', {
    method: 'POST',
    body: JSON.stringify({ email, codigo, novaSenha }),
  });
}
