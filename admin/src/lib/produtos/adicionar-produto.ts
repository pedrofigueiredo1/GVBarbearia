// ===== ADICIONAR PRODUTO =====
// Ctrl+F "ADICIONAR PRODUTO" para achar este bloco.
import { apiFetch } from '../api';
import type { Produto, ProdutoInput } from '@/types/produto';

export function criarProduto(data: ProdutoInput) {
  return apiFetch<Produto>('/produtos', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
