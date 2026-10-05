// ===== EDITAR PRODUTO =====
// Ctrl+F "EDITAR PRODUTO" para achar este bloco.
import { apiFetch } from '../api';
import type { Produto, ProdutoInput } from '@/types/produto';

export function editarProduto(id: number, data: ProdutoInput) {
  return apiFetch<Produto>(`/produtos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
