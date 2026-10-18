// ===== CONTEXTO DE AUTENTICACAO =====
// Ctrl+F "CONTEXTO DE AUTENTICACAO" para achar este bloco.
// Papel equivalente ao AuthGate do painel admin: guarda o token em memória
// (lido do armazenamento uma única vez ao abrir o app) e diz às rotas se o
// cliente está logado. Enquanto lê o armazenamento, `carregando` é true.
// Com token, busca também os dados do cliente logado (isso confirma que a
// sessão ainda vale: se o token expirou, o apiFetch derruba a sessão).
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { registrarAoSessaoExpirar } from '@/lib/api';
import { apagarToken, lerToken, salvarToken } from '@/lib/armazenamento-token';
import { consultarClienteLogado } from '@/lib/auth-cliente';
import type { ClienteLogado } from '@/types/cliente';

interface AuthContextValue {
  token: string | null;
  cliente: ClienteLogado | null;
  carregando: boolean;
  entrar: (token: string) => Promise<void>;
  atualizarCliente: (cliente: ClienteLogado) => void;
  sair: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [cliente, setCliente] = useState<ClienteLogado | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    lerToken()
      .then(setToken)
      .finally(() => setCarregando(false));

    registrarAoSessaoExpirar(() => setToken(null));
    return () => registrarAoSessaoExpirar(null);
  }, []);

  useEffect(() => {
    if (!token) {
      setCliente(null);
      return;
    }
    // Sem internet o app continua aberto com o token salvo; só um 401 encerra a sessão.
    consultarClienteLogado()
      .then(setCliente)
      .catch(() => {});
  }, [token]);

  const entrar = useCallback(async (novoToken: string) => {
    await salvarToken(novoToken);
    setToken(novoToken);
  }, []);

  const sair = useCallback(async () => {
    await apagarToken();
    setToken(null);
  }, []);

  const valor = useMemo(
    () => ({ token, cliente, carregando, entrar, atualizarCliente: setCliente, sair }),
    [token, cliente, carregando, entrar, sair],
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
