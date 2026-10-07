import { apiFetch } from './api';
import { setToken } from './auth';

interface LoginResponse {
  accessToken: string;
  administrador: { id: number; nome: string; login: string };
}

interface MensagemResponse {
  mensagem: string;
}

// Mantido separado de auth.ts (que só cuida do armazenamento do token) para
// evitar import circular com api.ts, que por sua vez lê o token de auth.ts.
export async function login(loginInput: string, senha: string) {
  const data = await apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ login: loginInput, senha }),
  });
  setToken(data.accessToken);
  return data.administrador;
}

// ===== SOLICITAR RECUPERACAO DE SENHA =====
// Ctrl+F "SOLICITAR RECUPERACAO DE SENHA" para achar este bloco.
export function solicitarRecuperacaoSenha(loginInput: string) {
  return apiFetch<MensagemResponse>('/auth/esqueci-senha', {
    method: 'POST',
    body: JSON.stringify({ login: loginInput }),
  });
}

// ===== REDEFINIR SENHA =====
// Ctrl+F "REDEFINIR SENHA" para achar este bloco.
export function redefinirSenha(token: string, novaSenha: string) {
  return apiFetch<MensagemResponse>('/auth/redefinir-senha', {
    method: 'POST',
    body: JSON.stringify({ token, novaSenha }),
  });
}
