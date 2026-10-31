'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Botao } from './Botao';

// ===== AVISOS (TOAST) E CONFIRMAÇÃO =====
// Ctrl+F "AVISOS (TOAST)" para achar este bloco.
// Substituem o alert() e o confirm() do navegador: o aviso aparece no canto da
// tela e some sozinho; a confirmação é uma janela no visual do painel.

type TipoAviso = 'sucesso' | 'erro' | 'info';

interface Aviso {
  id: number;
  tipo: TipoAviso;
  texto: string;
}

interface OpcoesConfirmacao {
  titulo: string;
  mensagem: string;
  textoConfirmar?: string;
  // 'perigo' deixa o botão vermelho (excluir, cancelar).
  tom?: 'perigo' | 'primario';
}

interface Contexto {
  avisar: (tipo: TipoAviso, texto: string) => void;
  confirmar: (opcoes: OpcoesConfirmacao) => Promise<boolean>;
}

const AvisosContext = createContext<Contexto | null>(null);

const ESTILO_AVISO: Record<TipoAviso, string> = {
  sucesso: 'border-emerald-400/40 bg-emerald-950/90 text-emerald-100',
  erro: 'border-red-400/40 bg-red-950/90 text-red-100',
  info: 'border-borda bg-superficie-alta text-foreground',
};

export function AvisosProvider({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const proximoId = useRef(1);

  const [confirmacao, setConfirmacao] = useState<
    (OpcoesConfirmacao & { resolver: (resposta: boolean) => void }) | null
  >(null);

  const avisar = useCallback((tipo: TipoAviso, texto: string) => {
    const id = proximoId.current++;
    setAvisos((atuais) => [...atuais, { id, tipo, texto }]);
    setTimeout(() => setAvisos((atuais) => atuais.filter((a) => a.id !== id)), 5000);
  }, []);

  const confirmar = useCallback(
    (opcoes: OpcoesConfirmacao) =>
      new Promise<boolean>((resolver) => setConfirmacao({ ...opcoes, resolver })),
    [],
  );

  function responder(resposta: boolean) {
    confirmacao?.resolver(resposta);
    setConfirmacao(null);
  }

  // Esc fecha a confirmação como "não".
  useEffect(() => {
    if (!confirmacao) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        confirmacao.resolver(false);
        setConfirmacao(null);
      }
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [confirmacao]);

  return (
    <AvisosContext.Provider value={{ avisar, confirmar }}>
      {children}

      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-80 flex-col gap-2">
        {avisos.map((aviso) => (
          <div
            key={aviso.id}
            role="status"
            className={`pointer-events-auto rounded-lg border px-4 py-3 text-sm shadow-lg ${ESTILO_AVISO[aviso.tipo]}`}
          >
            {aviso.texto}
          </div>
        ))}
      </div>

      {confirmacao && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"
          onClick={() => responder(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirmacao-titulo"
            className="w-full max-w-sm rounded-xl border border-borda bg-superficie p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="confirmacao-titulo" className="text-lg font-semibold">
              {confirmacao.titulo}
            </h3>
            <p className="mt-2 text-sm text-white/70">{confirmacao.mensagem}</p>
            <div className="mt-6 flex justify-end gap-2">
              <Botao variante="secundario" onClick={() => responder(false)}>
                Voltar
              </Botao>
              <Botao
                variante={confirmacao.tom === 'primario' ? 'primario' : 'perigo'}
                autoFocus
                onClick={() => responder(true)}
              >
                {confirmacao.textoConfirmar ?? 'Confirmar'}
              </Botao>
            </div>
          </div>
        </div>
      )}
    </AvisosContext.Provider>
  );
}

function useAvisosContext() {
  const contexto = useContext(AvisosContext);
  if (!contexto) throw new Error('Avisos só funcionam dentro do AvisosProvider.');
  return contexto;
}

// Aviso rápido no canto da tela: avisos.sucesso('Salvo!'), avisos.erro('...').
export function useAvisos() {
  const { avisar } = useAvisosContext();
  return {
    sucesso: (texto: string) => avisar('sucesso', texto),
    erro: (texto: string) => avisar('erro', texto),
    info: (texto: string) => avisar('info', texto),
  };
}

// Pergunta antes de uma ação: `if (!(await confirmar({...}))) return;`
export function useConfirmar() {
  return useAvisosContext().confirmar;
}
