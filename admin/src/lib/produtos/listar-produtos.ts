// ===== LISTAR PRODUTOS =====
// Ctrl+F "LISTAR PRODUTOS" para achar este bloco.
import { apiFetch } from '../api';
import type { Produto } from '@/types/produto';

export function listarProdutos() {
  return apiFetch<Produto[]>('/produtos');
}
