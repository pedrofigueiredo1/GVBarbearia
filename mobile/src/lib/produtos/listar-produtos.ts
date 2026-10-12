// ===== LISTAR PRODUTOS =====
// Ctrl+F "LISTAR PRODUTOS" para achar este bloco.
// US "Consulta de Produtos" (item 2.44).
import { apiFetch } from '../api';
import type { Produto } from '@/types/produto';

export function listarProdutos() {
  return apiFetch<Produto[]>('/publico/produtos');
}
