import { apiFetch } from './api';
import { setToken } from './auth';

interface LoginResponse {
  accessToken: string;
  administrador: { id: number; nome: string; login: string };
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
