'use client';

import { FormEvent, useEffect, useState } from 'react';
import { hojeLocal } from '@/lib/datas';
import { listarProfissionais } from '@/lib/profissionais';
import type { BloqueioAgendaInput } from '@/types/bloqueio';
import type { Profissional } from '@/types/profissional';

interface Props {
  onClose: () => void;
  onSalvar: (data: BloqueioAgendaInput) => Promise<void>;
}

const CAMPO = 'w-full rounded-lg border border-borda bg-superficie-alta text-foreground px-3 py-2 text-sm';

// Fecha a agenda de um barbeiro (folga, férias, atestado) ou de todos (feriado)
// em um dia ou num período. Para um dia só, a data final fica igual à inicial.
export function BloqueioFormModal({ onClose, onSalvar }: Props) {
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [form, setForm] = useState({
    profissionalId: '',
    dataInicio: '',
    dataFim: '',
    motivo: '',
  });
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    listarProfissionais()
      .then(setProfissionais)
      .catch(() => setErro('Não foi possível carregar os profissionais.'));
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErro(null);
    setSalvando(true);
    try {
      await onSalvar({
        profissionalId: form.profissionalId === '' ? null : Number(form.profissionalId),
        dataInicio: form.dataInicio,
        dataFim: form.dataFim || form.dataInicio,
        motivo: form.motivo,
      });
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao bloquear a agenda.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-superficie text-foreground rounded-xl shadow-xl w-full max-w-md p-6 border border-borda max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-1">Bloquear agenda</h3>
        <p className="mb-4 text-sm text-white/60">
          Nesses dias o cliente não consegue agendar pelo app e o painel também recusa novos
          agendamentos. Os que já estão marcados continuam.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="profissionalId">
              Barbeiro
            </label>
            <select
              id="profissionalId"
              className={CAMPO}
              value={form.profissionalId}
              onChange={(e) => setForm({ ...form, profissionalId: e.target.value })}
            >
              <option value="">Todos os barbeiros (feriado)</option>
              {profissionais.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="dataInicio">
                A partir de
              </label>
              <input
                id="dataInicio"
                type="date"
                required
                min={hojeLocal()}
                className={CAMPO}
                value={form.dataInicio}
                onChange={(e) =>
                  setForm({
                    ...form,
                    dataInicio: e.target.value,
                    // A data final acompanha a inicial enquanto não faz sentido ficar antes dela.
                    dataFim: form.dataFim && form.dataFim >= e.target.value ? form.dataFim : '',
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="dataFim">
                Até (opcional)
              </label>
              <input
                id="dataFim"
                type="date"
                min={form.dataInicio || hojeLocal()}
                className={CAMPO}
                value={form.dataFim}
                onChange={(e) => setForm({ ...form, dataFim: e.target.value })}
              />
            </div>
          </div>
          <p className="-mt-2 text-xs text-white/50">Deixe &quot;Até&quot; em branco para bloquear um dia só.</p>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="motivo">
              Motivo
            </label>
            <input
              id="motivo"
              type="text"
              required
              maxLength={120}
              placeholder="Ex.: Feriado de Natal, Folga, Atestado"
              className={CAMPO}
              value={form.motivo}
              onChange={(e) => setForm({ ...form, motivo: e.target.value })}
            />
          </div>

          {erro && <p className="text-sm text-red-600">{erro}</p>}

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm border border-borda"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="rounded-lg bg-copper text-copper-ink hover:brightness-110 px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {salvando ? 'Bloqueando...' : 'Bloquear agenda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
