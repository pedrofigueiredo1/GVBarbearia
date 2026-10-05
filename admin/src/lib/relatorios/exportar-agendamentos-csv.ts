// ===== EXPORTAR AGENDAMENTOS CSV =====
// Ctrl+F "EXPORTAR AGENDAMENTOS CSV" para achar este bloco.
// Gerado no navegador a partir dos dados já carregados — não há endpoint
// de exportação no backend. Separador ";" e BOM UTF-8 para o Excel em
// português abrir com as colunas e acentos corretos.
import type { Agendamento } from '@/types/agendamento';
import { STATUS_LABEL } from '@/types/agendamento';

const CABECALHO = ['Data', 'Horário', 'Cliente', 'Serviço', 'Profissional', 'Status'];

function escaparCampo(valor: string) {
  return `"${valor.replace(/"/g, '""')}"`;
}

export function exportarAgendamentosCsv(agendamentos: Agendamento[]) {
  const linhas = agendamentos.map((a) => {
    const data = new Date(a.dataHora);
    return [
      data.toLocaleDateString('pt-BR'),
      data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      a.cliente.nome,
      a.servico.nome,
      a.profissional.nome,
      STATUS_LABEL[a.status],
    ].map(escaparCampo);
  });

  const conteudo = [CABECALHO.map(escaparCampo), ...linhas].map((l) => l.join(';')).join('\r\n');
  const blob = new Blob(['﻿' + conteudo], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `relatorio-agendamentos-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
