import Link from 'next/link';

const modulos = [
  { nome: 'Profissionais', href: '/profissionais', disponivel: true },
  { nome: 'Serviços', href: '#', disponivel: false },
  { nome: 'Produtos', href: '#', disponivel: false },
  { nome: 'Barbearia', href: '#', disponivel: false },
  { nome: 'Administradores', href: '#', disponivel: false },
  { nome: 'Clientes', href: '#', disponivel: false },
  { nome: 'Agendamentos', href: '#', disponivel: false },
  { nome: 'Avaliações', href: '#', disponivel: false },
];

// Navegação simples do painel. Os módulos ainda não implementados ficam
// listados (desabilitados) para deixar visível o escopo completo do MVP
// conforme o cronograma vai avançando, dia a dia.
export function Sidebar() {
  return (
    <aside className="w-60 shrink-0 border-r border-black/10 dark:border-white/15 p-4">
      <h1 className="text-lg font-semibold mb-6 px-2">GV Barbearia</h1>
      <nav className="flex flex-col gap-1">
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
    </aside>
  );
}
