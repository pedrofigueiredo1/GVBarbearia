// Base comum dos PDFs dos relatórios: cabeçalho com a barbearia, o título e
// os filtros usados, tabelas e rodapé com data de geração e número da página.
// Usa só fontes padrão do PDF (Helvetica), por isso o texto evita símbolos
// fora do alfabeto latino.
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

type OpcoesTabela = Parameters<typeof autoTable>[1];
type DocComTabela = jsPDF & { lastAutoTable?: { finalY?: number } };

export interface DocumentoPdf {
  doc: jsPDF;
  y: number;
}

const MARGEM = 14;
const COR_CABECALHO_TABELA: [number, number, number] = [40, 40, 40];

export const SEM_FILTROS = 'Nenhum filtro aplicado (todos os registros)';

export function criarDocumento(opcoes: {
  titulo: string;
  filtros: string[];
  orientacao?: 'portrait' | 'landscape';
}): DocumentoPdf {
  const doc = new jsPDF({ orientation: opcoes.orientacao ?? 'portrait', unit: 'mm', format: 'a4' });
  const largura = doc.internal.pageSize.getWidth();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('GV Barbearia', MARGEM, 18);

  doc.setFontSize(13);
  doc.text(opcoes.titulo, MARGEM, 26);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(90);
  const linhasFiltros = doc.splitTextToSize(`Filtros: ${opcoes.filtros.join(' | ')}`, largura - MARGEM * 2);
  doc.text(linhasFiltros, MARGEM, 32);
  doc.setTextColor(0);

  const y = 32 + linhasFiltros.length * 4 + 2;
  doc.setDrawColor(180);
  doc.line(MARGEM, y, largura - MARGEM, y);

  return { doc, y: y + 8 };
}

export function adicionarResumo(d: DocumentoPdf, itens: [string, string][]) {
  d.doc.setFontSize(10);
  for (const [rotulo, valor] of itens) {
    d.doc.setFont('helvetica', 'bold');
    d.doc.text(`${rotulo}:`, MARGEM, d.y);
    d.doc.setFont('helvetica', 'normal');
    d.doc.text(valor, MARGEM + 52, d.y);
    d.y += 6;
  }
  d.y += 2;
}

export function adicionarSubtitulo(d: DocumentoPdf, texto: string) {
  const altura = d.doc.internal.pageSize.getHeight();
  if (d.y > altura - 40) {
    d.doc.addPage();
    d.y = 20;
  }
  d.doc.setFont('helvetica', 'bold');
  d.doc.setFontSize(11);
  d.doc.text(texto, MARGEM, d.y);
  d.y += 4;
}

export function adicionarTexto(d: DocumentoPdf, texto: string) {
  d.doc.setFont('helvetica', 'normal');
  d.doc.setFontSize(10);
  d.doc.text(texto, MARGEM, d.y);
  d.y += 8;
}

export function adicionarTabela(
  d: DocumentoPdf,
  cabecalho: string[],
  linhas: string[][],
  extras: Partial<OpcoesTabela> = {},
) {
  autoTable(d.doc, {
    startY: d.y,
    head: [cabecalho],
    body: linhas,
    margin: { left: MARGEM, right: MARGEM, bottom: 18 },
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: COR_CABECALHO_TABELA, textColor: 255 },
    ...extras,
  });
  const finalY = (d.doc as DocComTabela).lastAutoTable?.finalY ?? d.y;
  d.y = finalY + 8;
}

export function finalizar(d: DocumentoPdf, nomeBase: string) {
  const { doc } = d;
  const total = doc.getNumberOfPages();
  const largura = doc.internal.pageSize.getWidth();
  const altura = doc.internal.pageSize.getHeight();
  const geradoEm = new Date().toLocaleString('pt-BR');

  for (let pagina = 1; pagina <= total; pagina++) {
    doc.setPage(pagina);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(110);
    doc.text(`Gerado em ${geradoEm}`, MARGEM, altura - 8);
    doc.text(`Página ${pagina} de ${total}`, largura - MARGEM, altura - 8, { align: 'right' });
  }

  doc.save(`${nomeBase}-${new Date().toISOString().slice(0, 10)}.pdf`);
}
