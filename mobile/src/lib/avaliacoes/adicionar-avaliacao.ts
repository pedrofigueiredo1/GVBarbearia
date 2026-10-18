// ===== CADASTRAR AVALIACAO =====
// Ctrl+F "CADASTRAR AVALIACAO" para achar este bloco.
// US "Cadastro de Avaliação" do cliente (item 2.54). O backend só aceita
// avaliar um atendimento concluído do próprio cliente e que ainda não tenha
// avaliação.
import { apiFetch } from '../api';
import type { NovaAvaliacaoInput } from '@/types/avaliacao';

export function adicionarAvaliacao(data: NovaAvaliacaoInput) {
  return apiFetch<{ id: number; nota: number; comentario: string }>('/minhas-avaliacoes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
