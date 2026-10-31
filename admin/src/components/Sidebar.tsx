'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearToken } from '@/lib/auth';

// Ícones (24x24, traço) de cada módulo da barra lateral.
const ICONES: Record<string, string> = {
  dashboard: 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z',
  profissionais: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  servicos: 'M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12',
  produtos: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0',
  barbearia: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10',
  administradores: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10',
  clientes: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8',
  agendamentos: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2',
  avaliacoes: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z',
  relatorios: 'M18 20V10M12 20V4M6 20v-6',
};

const modulos = [
  { nome: 'Dashboard', href: '/', icone: 'dashboard' },
  { nome: 'Profissionais', href: '/profissionais', icone: 'profissionais' },
  { nome: 'Serviços', href: '/servicos', icone: 'servicos' },
  { nome: 'Produtos', href: '/produtos', icone: 'produtos' },
  { nome: 'Barbearia', href: '/barbearia', icone: 'barbearia' },
  { nome: 'Administradores', href: '/administradores', icone: 'administradores' },
  { nome: 'Clientes', href: '/clientes', icone: 'clientes' },
  { nome: 'Agendamentos', href: '/agendamentos', icone: 'agendamentos' },
  { nome: 'Avaliações', href: '/avaliacoes', icone: 'avaliacoes' },
  { nome: 'Relatórios', href: '/relatorios', icone: 'relatorios' },
];

function Icone({ caminho }: { caminho: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-[18px] h-[18px] shrink-0"
      aria-hidden="true"
    >
      <path d={caminho} />
    </svg>
  );
}

// Navegação do painel: logo da barbearia no topo, módulos com ícone (o da
// página atual fica em destaque cobre) e botão Sair no rodapé.
export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  // No celular o menu fica escondido e abre por cima da tela (botão no topo).
  const [aberto, setAberto] = useState(false);

  // Fecha o menu ao trocar de página e ao apertar Esc.
  useEffect(() => {
    setAberto(false);
  }, [pathname]);
  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e: KeyboardEvent) => e.key === 'Escape' && setAberto(false);
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [aberto]);

  function handleSair() {
    clearToken();
    router.push('/login');
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-3 border-b border-borda bg-superficie px-4 lg:hidden">
        <button
          onClick={() => setAberto(true)}
          aria-label="Abrir menu"
          aria-expanded={aberto}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/80 hover:bg-white/10"
        >
          <Icone caminho="M3 6h18M3 12h18M3 18h18" />
        </button>
        <Image src="/logo.png" alt="" width={32} height={32} />
        <span className="text-sm font-semibold tracking-widest text-copper">GV BARBEARIA</span>
      </header>

      {aberto && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setAberto(false)} aria-hidden="true" />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col overflow-y-auto border-r border-borda bg-superficie p-4 transition-transform lg:static lg:z-auto lg:translate-x-0 ${
          aberto ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setAberto(false)}
          aria-label="Fechar menu"
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 lg:hidden"
        >
          <Icone caminho="M18 6 6 18M6 6l12 12" />
        </button>
      <div className="flex flex-col items-center gap-1 mb-6 pt-2">
        <Image src="/logo.png" alt="GV Barbearia" width={96} height={96} priority />
        <span className="text-xs tracking-widest text-white/60">PAINEL ADMINISTRATIVO</span>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {modulos.map((modulo) => {
          const ativo =
            modulo.href === '/'
              ? pathname === '/'
              : pathname === modulo.href || pathname.startsWith(`${modulo.href}/`);
          return (
            <Link
              key={modulo.nome}
              href={modulo.href}
              aria-current={ativo ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                ativo
                  ? 'bg-copper/15 text-copper'
                  : 'text-white/70 hover:bg-white/5 hover:text-foreground'
              }`}
            >
              <Icone caminho={ICONES[modulo.icone]} />
              {modulo.nome}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={handleSair}
        title="Sair do painel administrativo"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-left text-red-600 border-t border-borda mt-2 pt-3 hover:bg-red-600/10"
      >
        <Icone caminho="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
        Sair
      </button>
      </aside>
    </>
  );
}
