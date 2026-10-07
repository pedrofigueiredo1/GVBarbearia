'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ApiError } from '@/lib/api';
import { solicitarRecuperacaoSenha } from '@/lib/authApi';

// US Recuperação de Senha de Administrador (item 2.2): a mensagem exibida é
// sempre a mesma, exista o e-mail ou não (CT02), para não revelar quais
// e-mails estão cadastrados.
export default function EsqueciSenhaPage() {
  const [loginInput, setLoginInput] = useState('');
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const resposta = await solicitarRecuperacaoSenha(loginInput);
      setMensagem(resposta.mensagem);
    } catch (err) {
      setErro(
        err instanceof ApiError ? err.message : 'Não foi possível enviar. Verifique se a API está no ar.',
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm flex flex-col gap-4 border border-black/10 dark:border-white/15 rounded-lg p-6"
      >
        <h1 className="text-lg font-semibold text-center mb-2">Recuperar senha</h1>

        {mensagem ? (
          <p className="text-sm">{mensagem}</p>
        ) : (
          <>
            <p className="text-sm text-black/60 dark:text-white/60">
              Informe o e-mail cadastrado. Enviaremos um link para você criar uma nova senha.
            </p>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="login">
                E-mail
              </label>
              <input
                id="login"
                type="email"
                required
                autoFocus
                className="w-full rounded border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
              />
            </div>

            {erro && <p className="text-sm text-red-600">{erro}</p>}

            <button
              type="submit"
              disabled={enviando}
              className="rounded bg-foreground text-background px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {enviando ? 'Enviando...' : 'Enviar link'}
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
