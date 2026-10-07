'use client';

import { FormEvent, Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ApiError } from '@/lib/api';
import { redefinirSenha } from '@/lib/authApi';

function RedefinirSenhaForm() {
  const token = useSearchParams().get('token') ?? '';
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErro(null);

    if (novaSenha !== confirmacao) {
      setErro('As senhas não conferem.');
      return;
    }

    setSalvando(true);
    try {
      const resposta = await redefinirSenha(token, novaSenha);
      setMensagem(resposta.mensagem);
    } catch (err) {
      setErro(
        err instanceof ApiError ? err.message : 'Não foi possível redefinir. Verifique se a API está no ar.',
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm flex flex-col gap-4 border border-black/10 dark:border-white/15 rounded-lg p-6"
      >
        <h1 className="text-lg font-semibold text-center mb-2">Criar nova senha</h1>

        {!token && (
          <p className="text-sm text-red-600">
            Link inválido. Solicite um novo link de recuperação.
          </p>
        )}

        {token && mensagem && <p className="text-sm">{mensagem}</p>}

        {token && !mensagem && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="novaSenha">
                Nova senha
              </label>
              <input
                id="novaSenha"
                type="password"
                required
                minLength={6}
                maxLength={72}
                autoFocus
                className="w-full rounded border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="confirmacao">
                Confirmar nova senha
              </label>
              <input
                id="confirmacao"
                type="password"
                required
                minLength={6}
                maxLength={72}
                className="w-full rounded border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
                value={confirmacao}
                onChange={(e) => setConfirmacao(e.target.value)}
              />
            </div>

            {erro && <p className="text-sm text-red-600">{erro}</p>}

            <button
              type="submit"
              disabled={salvando}
              className="rounded bg-foreground text-background px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {salvando ? 'Salvando...' : 'Redefinir senha'}
            </button>
          </>
        )}

        <Link href="/login" className="text-sm underline text-center">
          Voltar para o login
        </Link>
      </form>
    </div>
  );
}

// useSearchParams exige um limite de Suspense no Next.js.
export default function RedefinirSenhaPage() {
  return (
    <Suspense fallback={null}>
      <RedefinirSenhaForm />
    </Suspense>
  );
}
