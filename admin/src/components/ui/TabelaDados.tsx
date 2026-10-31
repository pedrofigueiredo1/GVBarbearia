import type { ReactNode } from 'react';
import type { Coluna, Ordenacao } from '@/types/tabela';
import { Botao } from './Botao';
import { Icone } from './Icone';
import { Paginacao } from './Paginacao';

interface PropsPaginacao {
  pagina: number;
  total: number;
  tamanho: number;
  aoMudarPagina: (pagina: number) => void;
  aoMudarTamanho: (tamanho: number) => void;
}

interface Props<T> {
  colunas: Coluna<T>[];
  linhas: T[];
  chaveLinha: (item: T) => string | number;
  carregando: boolean;
  erro: string | null;
  aoTentarNovamente: () => void;
  // Mensagem quando não há nenhum registro cadastrado.
  mensagemVazia: string;
  // Verdadeiro quando há busca ou filtro ligado: a mensagem muda para "nenhum resultado".
  filtrando?: boolean;
  ordenacao: Ordenacao | null;
  aoOrdenar: (chave: string) => void;
  paginacao: PropsPaginacao;
  // Botões da última coluna (editar, excluir...).
  acoes?: (item: T) => ReactNode;
}

// Tabela padrão das telas do painel: cabeçalho que ordena, linhas com
// passagem do mouse, estado de carregamento, erro, vazio e rodapé de paginação.
export function TabelaDados<T>({
  colunas,
  linhas,
  chaveLinha,
  carregando,
  erro,
  aoTentarNovamente,
  mensagemVazia,
  filtrando = false,
  ordenacao,
  aoOrdenar,
  paginacao,
  acoes,
}: Props<T>) {
  const primeiraCarga = carregando && linhas.length === 0;
  const totalColunas = colunas.length + (acoes ? 1 : 0);

  return (
    <div className="overflow-hidden rounded-xl border border-borda bg-superficie">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-borda text-left">
              {colunas.map((coluna) => {
                const ativa = ordenacao?.chave === coluna.chave;
                return (
                  <th
                    key={coluna.chave}
                    className={`px-4 py-3 font-medium ${coluna.className ?? ''}`}
                    aria-sort={ativa ? (ordenacao?.direcao === 'asc' ? 'ascending' : 'descending') : undefined}
                  >
                    {coluna.ordenavel ? (
                      <button
                        onClick={() => aoOrdenar(coluna.chave)}
                        className={`inline-flex items-center gap-1 uppercase tracking-wide hover:text-foreground ${
                          ativa ? 'text-copper' : ''
                        }`}
                      >
                        {coluna.titulo}
                        <Icone
                          nome={ativa ? (ordenacao?.direcao === 'asc' ? 'cima' : 'baixo') : 'ordenar'}
                          tamanho={12}
                        />
                      </button>
                    ) : (
                      coluna.titulo
                    )}
                  </th>
                );
              })}
              {acoes && <th className="w-px px-4 py-3 text-right font-medium">Ações</th>}
            </tr>
          </thead>

          <tbody className={carregando && !primeiraCarga ? 'opacity-50 transition-opacity' : ''}>
            {primeiraCarga &&
              Array.from({ length: 5 }, (_, i) => (
                <tr key={`esqueleto-${i}`} className="border-b border-borda/60">
                  <td colSpan={totalColunas} className="px-4 py-3">
                    <div className="h-4 animate-pulse rounded bg-white/10" />
                  </td>
                </tr>
              ))}

            {!carregando && erro && (
              <tr>
                <td colSpan={totalColunas} className="px-4 py-10 text-center">
                  <p className="mb-3 text-sm text-red-400">{erro}</p>
                  <Botao variante="secundario" tamanho="pequeno" onClick={aoTentarNovamente}>
                    Tentar novamente
                  </Botao>
                </td>
              </tr>
            )}

            {!carregando && !erro && linhas.length === 0 && (
              <tr>
                <td colSpan={totalColunas} className="px-4 py-12 text-center text-white/50">
                  {filtrando ? 'Nenhum resultado para os filtros escolhidos.' : mensagemVazia}
                </td>
              </tr>
            )}

            {!erro &&
              linhas.map((linha) => (
                <tr key={chaveLinha(linha)} className="border-b border-borda/60 last:border-b-0">
                  {colunas.map((coluna) => (
                    <td key={coluna.chave} className={`px-4 py-3 ${coluna.className ?? ''}`}>
                      {coluna.render(linha)}
                    </td>
                  ))}
                  {acoes && (
                    <td className="px-4 py-2 text-right">
                      <div className="flex justify-end gap-1">{acoes(linha)}</div>
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {!erro && !primeiraCarga && <Paginacao {...paginacao} />}
    </div>
  );
}
