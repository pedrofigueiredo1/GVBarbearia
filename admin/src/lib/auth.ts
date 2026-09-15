const TOKEN_KEY = 'gvbarbearia_token';

// localStorage só existe no navegador — cada função checa `typeof window`
// para não quebrar durante a renderização no servidor (Next.js App Router).
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return getToken() !== null;
}
