'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '@/lib/api';
import type { Ordenacao, Pagina } from '@/types/tabela';

export interface ParametrosPagina {
  pagina: number;
  limite: number;
  busca: string;
  ordenarPor?: string;
  direcao?: 'asc' | 'desc';
}

type Filtros = Record<string, string | number | undefined>;

interface Opcoes {
  ordenacaoInicial?: Ordenacao;
  tamanhoInicial?: number;
  mensagemErro: string;
}

// Busca, filtros, ordenação e paginação feitas no servidor, para as telas que
// crescem sem limite (clientes, agendamentos). A cada mudança pede só a página
// necessária; a busca espera o usuário parar de digitar antes de ir à API.
export function useTabelaServidor<T>(
  buscarPagina: (parametros: ParametrosPagina & Filtros) => Promise<Pagina<T>>,
  filtros: Filtros,
  opcoes: Opcoes,
) {
  const { ordenacaoInicial, tamanhoInicial = 10, mensagemErro } = opcoes;

  const [busca, setBuscaBruta] = useState('');
  const [buscaAplicada, setBuscaAplicada] = useState('');
  const [pagina, setPagina] = useState(1);
  const [tamanho, setTamanhoBruto] = useState(tamanhoInicial);
  const [ordenacao, setOrdenacao] = useState<Ordenacao | null>(ordenacaoInicial ?? null);
  const [resposta, setResposta] = useState<Pagina<T> | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [versao, setVersao] = useState(0);

  const filtrosChave = JSON.stringify(filtros);
  const buscarRef = useRef(buscarPagina);
  buscarRef.current = buscarPagina;

  // Espera 350 ms sem digitar para aplicar a busca.
  useEffect(() => {
    const espera = setTimeout(() => {
      setBuscaAplicada(busca.trim());
      setPagina(1);
    }, 350);
    return () => clearTimeout(espera);
  }, [busca]);

  // Mudou algum filtro da tela: volta para a primeira página.
  useEffect(() => {
    setPagina(1);
  }, [filtrosChave]);

  useEffect(() => {
    let cancelado = false;
    setCarregando(true);
    setErro(null);

    buscarRef
      .current({
        pagina,
        limite: tamanho,
        busca: buscaAplicada,
        ordenarPor: ordenacao?.chave,
        direcao: ordenacao?.direcao,
        ...(JSON.parse(filtrosChave) as Filtros),
      })
      .then((r) => {
        if (!cancelado) setResposta(r);
      })
      .catch((err) => {
        if (!cancelado) setErro(err instanceof ApiError ? err.message : mensagemErro);
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [pagina, tamanho, buscaAplicada, ordenacao, filtrosChave, versao, mensagemErro]);

  const total = resposta?.total ?? 0;

  // Excluiu o último item de uma página: volta uma página para não ficar vazia.
  useEffect(() => {
    if (!carregando && resposta && resposta.itens.length === 0 && pagina > 1) {
      setPagina((p) => Math.max(1, p - 1));
    }
  }, [carregando, resposta, pagina]);

  const recarregar = useCallback(() => setVersao((v) => v + 1), []);

  return {
    linhas: resposta?.itens ?? [],
    total,
    pagina,
    tamanho,
    ordenacao,
    busca,
    carregando,
    erro,
    recarregar,
    setBusca: setBuscaBruta,
    setPagina,
    setTamanho(novo: number) {
      setTamanhoBruto(novo);
      setPagina(1);
    },
    ordenar(chave: string) {
      setOrdenacao((atual) =>
        atual?.chave === chave
          ? { chave, direcao: atual.direcao === 'asc' ? 'desc' : 'asc' }
          : { chave, direcao: 'asc' },
      );
      setPagina(1);
    },
    limparBusca() {
      setBuscaBruta('');
      setBuscaAplicada('');
      setPagina(1);
    },
    filtrando: buscaAplicada !== '' || Object.values(filtros).some((v) => v !== undefined && v !== ''),
  };
}
