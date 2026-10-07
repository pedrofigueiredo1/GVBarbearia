'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clearToken } from '@/lib/auth';

const modulos = [
  { nome: 'Profissionais', href: '/profissionais', disponivel: true },
  { nome: 'Serviços', href: '/servicos', disponivel: true },
  { nome: 'Produtos', href: '/produtos', disponivel: true },
  { nome: 'Barbearia', href: '/barbearia', disponivel: true },
  { nome: 'Administradores', href: '/administradores', disponivel: true },
  { nome: 'Clientes', href: '/clientes', disponivel: true },
  { nome: 'Agendamentos', href: '/agendamentos', disponivel: true },
  { nome: 'Avaliações', href: '/avaliacoes', disponivel: true },
  { nome: 'Relatórios', href: '/relatorios', disponivel: true },
];

// Navegação simples do painel — todos os módulos do MVP já implementados.
export function Sidebar() {
  const router = useRouter();

  function handleSair() {
    clearToken();
    router.push('/login');
  }

  return (
    <aside className="w-60 shrink-0 border-r border-black/10 dark:border-white/15 p-4 flex flex-col">
      <h1 className="text-lg font-semibold mb-6 px-2">GV Barbearia</h1>
      <nav className="flex flex-col gap-1 flex-1">
        {modulos.map((modulo) =>
          modulo.disponivel ? (
            <Link
              key={modulo.nome}
              href={modulo.href}
              className="rounded px-2 py-1.5 text-sm hover:bg-black/5 dark:hover:bg-white/10"
            >
              {modulo.nome}
            </Link>
          ) : (
            <span
              key={modulo.nome}
              title="Ainda não implementado"
              className="rounded px-2 py-1.5 text-sm text-black/35 dark:text-white/35 cursor-not-allowed"
            >
              {modulo.nome}
            </span>
          ),
        )}
      </nav>
      <button
        onClick={handleSair}
        title="Sair do painel administrativo"
        className="flex items-center gap-2 rounded px-2 py-1.5 text-sm text-left text-red-600 border-t border-black/10 dark:border-white/15 mt-2 pt-3 hover:bg-red-600/10"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4"
          aria-hidden="true"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Sair
      </button>
    </aside>
  );
}
