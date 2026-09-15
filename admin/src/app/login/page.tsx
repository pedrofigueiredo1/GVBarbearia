'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError } from '@/lib/api';
import { login } from '@/lib/authApi';

// Reflete os Critérios da US Login de Administrador: usuário (e-mail) e
// senha, com mensagem de erro em caso de credenciais inválidas (CT02).
export default function LoginPage() {
  const router = useRouter();
  const [loginInput, setLoginInput] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [entrando, setEntrando] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErro(null);
    setEntrando(true);
    try {
      await login(loginInput, senha);
      router.push('/');
    } catch (err) {
      setErro(
        err instanceof ApiError ? err.message : 'Não foi possível entrar. Verifique se a API está no ar.',
      );
    } finally {
      setEntrando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm flex flex-col gap-4 border border-black/10 dark:border-white/15 rounded-lg p-6"
      >
        <h1 className="text-lg font-semibold text-center mb-2">
          GV Barbearia — Painel Administrativo
        </h1>

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

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="senha">
            Senha
          </label>
          <input
            id="senha"
            type="password"
            required
            className="w-full rounded border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>

        {erro && <p className="text-sm text-red-600">{erro}</p>}

        <button
          type="submit"
          disabled={entrando}
          className="rounded bg-foreground text-background px-4 py-2 text-sm font-medium disabled:opacity-50 mt-2"
        >
          {entrando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
