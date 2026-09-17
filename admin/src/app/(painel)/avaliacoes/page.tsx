'use client';

import { useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';
import { editarAvaliacao, excluirAvaliacao, listarAvaliacoes } from '@/lib/avaliacoes';
import type { Avaliacao, AvaliacaoInput } from '@/types/avaliacao';
import { AvaliacaoFormModal } from '@/components/AvaliacaoFormModal';

// Sem botão "+ Nova avaliação": o Cadastro de Avaliação é feito pelo
// próprio cliente no app (fase posterior), vinculado a um atendimento
// concluído — este painel só tem Consulta, Edição e Exclusão.
export default function AvaliacoesPage() {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [avaliacaoEmEdicao, setAvaliacaoEmEdicao] = useState<Avaliacao | null>(null);

  async function carregar() {
    setCarregando(true);
    setErro(null);
    try {
      setAvaliacoes(await listarAvaliacoes());
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível carregar as avaliações. Verifique se a API está no ar.',
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function handleSalvar(data: AvaliacaoInput) {
    if (!avaliacaoEmEdicao) return;
    await editarAvaliacao(avaliacaoEmEdicao.id, data);
    setAvaliacaoEmEdicao(null);
    await carregar();
  }

  async function handleExcluir(avaliacao: Avaliacao) {
    const confirmado = window.confirm(
      `Excluir a avaliação de "${avaliacao.agendamento.cliente.nome}"? Essa ação não pode ser desfeita.`,
    );
    if (!confirmado) return;

    try {
      await excluirAvaliacao(avaliacao.id);
      await carregar();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Não foi possível excluir a avaliação.');
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Avaliações</h2>

      {carregando && <p className="text-sm text-black/60 dark:text-white/60">Carregando...</p>}

      {!carregando && erro && (
        <p className="text-sm text-red-600 border border-red-200 rounded p-3">{erro}</p>
      )}

      {!carregando && !erro && avaliacoes.length === 0 && (
        <p className="text-sm text-black/60 dark:text-white/60">Nenhuma avaliação registrada.</p>
      )}

      {!carregando && !erro && avaliacoes.length > 0 && (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b border-black/10 dark:border-white/15">
              <th className="py-2 pr-4 font-medium">Autor</th>
              <th className="py-2 pr-4 font-medium">Serviço</th>
              <th className="py-2 pr-4 font-medium">Profissional</th>
              <th className="py-2 pr-4 font-medium">Nota</th>
              <th className="py-2 pr-4 font-medium">Comentário</th>
              <th className="py-2 pr-4 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {avaliacoes.map((avaliacao) => (
              <tr key={avaliacao.id} className="border-b border-black/5 dark:border-white/10">
                <td className="py-2 pr-4">{avaliacao.agendamento.cliente.nome}</td>
                <td className="py-2 pr-4">{avaliacao.agendamento.servico.nome}</td>
                <td className="py-2 pr-4">{avaliacao.agendamento.profissional.nome}</td>
                <td className="py-2 pr-4">{avaliacao.nota} / 5</td>
                <td className="py-2 pr-4 max-w-xs truncate" title={avaliacao.comentario}>
                  {avaliacao.comentario}
                </td>
                <td className="py-2 pr-4 whitespace-nowrap">
                  <button
                    onClick={() => setAvaliacaoEmEdicao(avaliacao)}
                    className="text-sm underline mr-4"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleExcluir(avaliacao)}
                    className="text-sm underline text-red-600"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {avaliacaoEmEdicao && (
        <AvaliacaoFormModal
          avaliacao={avaliacaoEmEdicao}
          onClose={() => setAvaliacaoEmEdicao(null)}
          onSalvar={handleSalvar}
        />
      )}
    </div>
  );
}
