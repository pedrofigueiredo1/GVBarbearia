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
  { nome: 'Agendamentos', href: '#', disponivel: false },
  { nome: 'Avaliações', href: '#', disponivel: false },
];

// Navegação simples do painel. Os módulos ainda não implementados ficam
// listados (desabilitados) para deixar visível o escopo completo do MVP
// conforme o cronograma vai avançando, dia a dia.
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
        className="rounded px-2 py-1.5 text-sm text-left hover:bg-black/5 dark:hover:bg-white/10"
      >
        Sair
      </button>
    </aside>
  );
}
