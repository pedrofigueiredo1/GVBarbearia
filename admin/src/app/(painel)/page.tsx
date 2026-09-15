import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">Painel Administrativo</h2>
      <p className="text-black/60 dark:text-white/60 mb-6">
        Selecione um módulo no menu ao lado para começar.
      </p>
      <Link
        href="/profissionais"
        className="inline-block rounded bg-foreground text-background px-4 py-2 text-sm font-medium"
      >
        Gerenciar Profissionais
      </Link>
    </div>
  );
}
