// ===== CONTEXTO DE AUTENTICACAO =====
// Ctrl+F "CONTEXTO DE AUTENTICACAO" para achar este bloco.
// Papel equivalente ao AuthGate do painel admin: guarda o token em memória
// (lido do armazenamento uma única vez ao abrir o app) e diz às rotas se o
// cliente está logado. Enquanto lê o armazenamento, `carregando` é true.
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { registrarAoSessaoExpirar } from '@/lib/api';
import { apagarToken, lerToken, salvarToken } from '@/lib/armazenamento-token';

interface AuthContextValue {
  token: string | null;
  carregando: boolean;
  entrar: (token: string) => Promise<void>;
  sair: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    lerToken()
      .then(setToken)
      .finally(() => setCarregando(false));

    registrarAoSessaoExpirar(() => setToken(null));
    return () => registrarAoSessaoExpirar(null);
  }, []);

  const entrar = useCallback(async (novoToken: string) => {
    await salvarToken(novoToken);
    setToken(novoToken);
  }, []);

  const sair = useCallback(async () => {
    await apagarToken();
    setToken(null);
  }, []);

  const valor = useMemo(
    () => ({ token, carregando, entrar, sair }),
    [token, carregando, entrar, sair],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth precisa estar dentro de um AuthProvider.');
  }
  return contexto;
}
