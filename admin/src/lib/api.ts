import { clearToken, getToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

// Wrapper único para as chamadas à API do NestJS: centraliza a montagem da
// URL, o parse do JSON, o header de autenticação e a extração da mensagem
// de erro que o backend retorna (ex.: as mensagens do class-validator).
export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const token = getToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    // Um 401 com token presente significa que a sessão expirou/é inválida —
    // limpa e manda pro login. Sem token (ex.: a própria tentativa de
    // login), o 401 é só "credenciais inválidas" e quem chamou trata a
    // mensagem normalmente.
    if (response.status === 401 && token) {
      clearToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    const body = await response.json().catch(() => null);
    const message = Array.isArray(body?.message)
      ? body.message.join(' ')
      : (body?.message ?? `Erro ao comunicar com a API (HTTP ${response.status}).`);
    throw new ApiError(message, response.status);
  }

  // Nest envia corpo vazio (Content-Length: 0) quando o controller retorna
  // null/undefined — ex.: GET /barbearia sem registro cadastrado ainda.
  // response.json() quebra em corpo vazio, então tratamos esse caso à parte
  // em vez de tentar fazer parse de uma string vazia.
  const hasBody = response.headers.get('content-length') !== '0';
  if (response.status === 204 || !hasBody) {
    return null as T;
  }

  return response.json();
}
