'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';

// Busca uma lista na API ao abrir a tela e controla carregando, erro e dados.
// `buscar` precisa ser uma função estável (as de lib/ são).
export function useCarregarLista<T>(buscar: () => Promise<T[]>, mensagemErro: string) {
  const [dados, setDados] = useState<T[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setDados(await buscar());
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : mensagemErro);
    } finally {
      setCarregando(false);
    }
  }, [buscar, mensagemErro]);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  return { dados, carregando, erro, recarregar };
}
