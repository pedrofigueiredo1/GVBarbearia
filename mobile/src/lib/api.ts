// ===== CLIENTE DA API =====
// Ctrl+F "CLIENTE DA API" para achar este bloco.
// Equivalente ao apiFetch do painel admin: monta a URL, anexa o token,
// converte o JSON e extrai a mensagem de erro que o NestJS devolve (incluindo
// a lista de mensagens do class-validator).
import { apagarToken, lerToken } from './armazenamento-token';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

// O AuthContext registra aqui o que fazer quando a sessão expira, já que
// este arquivo roda fora da árvore do React.
let aoSessaoExpirar: (() => void) | null = null;

export function registrarAoSessaoExpirar(callback: (() => void) | null) {
  aoSessaoExpirar = callback;
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await lerToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    // 401 com token presente = sessão expirada ou inválida: limpa o token e
    // avisa o app (que volta para o login). Sem token (ex.: a própria
    // tentativa de login), o 401 é só "credenciais inválidas".
    if (response.status === 401 && token) {
      await apagarToken();
      aoSessaoExpirar?.();
    }

    const body = await response.json().catch(() => null);
    const message = Array.isArray(body?.message)
      ? body.message.join(' ')
      : (body?.message ?? `Erro ao comunicar com a API (HTTP ${response.status}).`);
    throw new ApiError(message, response.status);
  }

  // O Nest envia corpo vazio quando o controller retorna null/undefined.
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null as T;
  }

  return response.json();
}
