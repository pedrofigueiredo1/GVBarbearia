'use client';

import { useMemo, useState } from 'react';
import type { Coluna, Ordenacao } from '@/types/tabela';

// Tira acentos e maiúsculas, para a busca achar "José" digitando "jose".
function normalizar(texto: string) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

interface Opcoes<T> {
  colunas: Coluna<T>[];
  // Texto em que a busca procura (nome, e-mail...).
  textoBusca: (item: T) => string;
  // Filtro extra da tela (nota, profissional...), aplicado junto com a busca.
  filtro?: (item: T) => boolean;
  ordenacaoInicial?: Ordenacao;
  tamanhoInicial?: number;
}

// Busca, ordenação e paginação feitas no navegador, para as telas com poucos
// registros (serviços, produtos, profissionais...). A lista inteira já foi
// carregada; aqui só se decide o que mostrar.
export function useTabelaLocal<T>(dados: T[], opcoes: Opcoes<T>) {
  const { colunas, textoBusca, filtro, ordenacaoInicial, tamanhoInicial = 10 } = opcoes;

  const [busca, setBuscaBruta] = useState('');
  const [pagina, setPagina] = useState(1);
  const [tamanho, setTamanhoBruto] = useState(tamanhoInicial);
  const [ordenacao, setOrdenacao] = useState<Ordenacao | null>(ordenacaoInicial ?? null);

  const filtrados = useMemo(() => {
    const termo = normalizar(busca.trim());
    return dados.filter((item) => {
      if (filtro && !filtro(item)) return false;
      return termo === '' || normalizar(textoBusca(item)).includes(termo);
    });
  }, [dados, busca, filtro, textoBusca]);

  const ordenados = useMemo(() => {
    const coluna = colunas.find((c) => c.chave === ordenacao?.chave);
    if (!ordenacao || !coluna?.valor) return filtrados;
    const valor = coluna.valor;
    const sinal = ordenacao.direcao === 'asc' ? 1 : -1;
    return [...filtrados].sort((a, b) => {
      const va = valor(a);
      const vb = valor(b);
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * sinal;
      return String(va).localeCompare(String(vb), 'pt-BR') * sinal;
    });
  }, [filtrados, colunas, ordenacao]);

  // Se a lista encolheu (exclusão, filtro), a página atual nunca passa da última.
  const ultimaPagina = Math.max(1, Math.ceil(ordenados.length / tamanho));
  const paginaAtual = Math.min(pagina, ultimaPagina);
  const linhas = ordenados.slice((paginaAtual - 1) * tamanho, paginaAtual * tamanho);

  return {
    linhas,
    total: ordenados.length,
    pagina: paginaAtual,
    tamanho,
    ordenacao,
    busca,
    setBusca(texto: string) {
      setBuscaBruta(texto);
      setPagina(1);
    },
    setPagina,
    setTamanho(novo: number) {
      setTamanhoBruto(novo);
      setPagina(1);
    },
    // Clique no cabeçalho: ordena de A a Z; clicar de novo inverte.
    ordenar(chave: string) {
      setOrdenacao((atual) =>
        atual?.chave === chave
          ? { chave, direcao: atual.direcao === 'asc' ? 'desc' : 'asc' }
          : { chave, direcao: 'asc' },
      );
      setPagina(1);
    },
    voltarParaPrimeira: () => setPagina(1),
    // Há busca ou filtro ligado?
    filtrando: busca.trim() !== '' || filtrados.length !== dados.length,
  };
}
