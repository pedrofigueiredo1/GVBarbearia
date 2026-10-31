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

// O token é um JWT: o horário de expiração (exp, em segundos) está no corpo.
// Um token vencido não conta como login — evita mostrar o painel vazio e só
// descobrir a expiração na primeira chamada à API.
function tokenExpirado(token: string): boolean {
  try {
    const corpo = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof corpo.exp === 'number' && corpo.exp * 1000 <= Date.now();
  } catch {
    return true; // token malformado
  }
}

export function isAuthenticated(): boolean {
  const token = getToken();
  if (token === null) return false;
  if (tokenExpirado(token)) {
    clearToken();
    return false;
  }
  return true;
}
