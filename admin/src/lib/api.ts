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
// URL, o parse do JSON e a extração da mensagem de erro que o backend
// retorna (ex.: as mensagens do class-validator), para exibir na tela.
export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
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
