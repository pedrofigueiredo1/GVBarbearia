import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';

// Busca dados da API ao abrir a tela e controla os três estados que toda
// tela de consulta tem: carregando, erro e dados. `buscar` precisa ser uma
// função estável (as de lib/ são), senão a tela recarregaria sem parar.
export function useCarregar<T>(buscar: () => Promise<T>) {
  const [dados, setDados] = useState<T | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setDados(await buscar());
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível carregar. Verifique sua conexão com a internet.',
      );
    } finally {
      setCarregando(false);
    }
  }, [buscar]);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  return { dados, carregando, erro, recarregar };
}
