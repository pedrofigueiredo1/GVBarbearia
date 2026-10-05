// ===== CONSULTAR BARBEARIA =====
// Ctrl+F "CONSULTAR BARBEARIA" para achar este bloco.
// Retorna null quando ainda não há informações cadastradas (US Consulta,
// CT02) — não é um erro, é um estado normal a ser exibido na tela.
import { apiFetch } from '../api';
import type { Barbearia } from '@/types/barbearia';

export function consultarBarbearia() {
  return apiFetch<Barbearia | null>('/barbearia');
}
