import Link from 'next/link';

const relatorios = [
  {
    titulo: 'Agendamentos',
    descricao:
      'Totais por status (confirmado, concluído, cancelado) e lista detalhada, com filtros por período, cliente, serviço e profissional. Todos os relatórios podem ser exportados em PDF para impressão.',
    href: '/relatorios/agendamentos',
  },
  {
    titulo: 'Serviços mais agendados',
    descricao: 'Ranking dos serviços mais procurados no período, com o valor total estimado de cada um.',
    href: '/relatorios/servicos',
  },
  {
    titulo: 'Atendimento por profissional',
    descricao:
      'Quantidade de atendimentos concluídos, serviços mais realizados e avaliação média de cada profissional.',
    href: '/relatorios/profissionais',
  },
  {
    titulo: 'Clientes',
    descricao:
      'Clientes cadastrados, novos no período, clientes frequentes (5 ou mais atendimentos concluídos) e último agendamento de cada um.',
    href: '/relatorios/clientes',
  },
  {
    titulo: 'Avaliações',
    descricao:
      'Média geral, distribuição das notas de 1 a 5 e comentários mais recentes, com filtros por período, profissional e serviço.',
    href: '/relatorios/avaliacoes',
  },
];

// Ponto de entrada dos relatórios: a barra lateral tem só o item "Relatórios"
// e daqui o administrador escolhe qual relatório emitir ou consultar.
export default function RelatoriosPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">Relatórios</h2>
      <p className="text-sm text-black/60 dark:text-white/60 mb-6">
        Escolha qual relatório deseja emitir ou consultar.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {relatorios.map((relatorio) => (
          <Link
            key={relatorio.href}
            href={relatorio.href}
            className="rounded border border-black/10 dark:border-white/15 p-4 hover:bg-black/5 dark:hover:bg-white/10"
          >
            <h3 className="font-medium mb-1">{relatorio.titulo}</h3>
            <p className="text-sm text-black/60 dark:text-white/60">{relatorio.descricao}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
