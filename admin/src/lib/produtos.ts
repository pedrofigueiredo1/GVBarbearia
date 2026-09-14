import { apiFetch } from './api';
import type { Produto, ProdutoInput } from '@/types/produto';

export function listarProdutos() {
  return apiFetch<Produto[]>('/produtos');
}

export function criarProduto(data: ProdutoInput) {
  return apiFetch<Produto>('/produtos', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function editarProduto(id: number, data: ProdutoInput) {
  return apiFetch<Produto>(`/produtos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function excluirProduto(id: number) {
  return apiFetch<void>(`/produtos/${id}`, { method: 'DELETE' });
}
