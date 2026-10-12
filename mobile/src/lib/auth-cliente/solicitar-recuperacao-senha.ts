// ===== SOLICITAR RECUPERACAO DE SENHA =====
// Ctrl+F "SOLICITAR RECUPERACAO DE SENHA" para achar este bloco.
import { apiFetch } from '../api';
import type { MensagemResposta } from '@/types/cliente';

export function solicitarRecuperacaoSenha(email: string) {
  return apiFetch<MensagemResposta>('/auth/cliente/esqueci-senha', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}
