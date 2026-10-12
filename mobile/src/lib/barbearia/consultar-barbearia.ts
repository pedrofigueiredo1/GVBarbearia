// ===== CONSULTAR BARBEARIA =====
// Ctrl+F "CONSULTAR BARBEARIA" para achar este bloco.
// US "Consulta de Informações da Barbearia" (item 2.41). Devolve null quando
// o administrador ainda não cadastrou as informações (CT02).
import { apiFetch } from '../api';
import type { Barbearia } from '@/types/barbearia';

export function consultarBarbearia() {
  return apiFetch<Barbearia | null>('/publico/barbearia');
}
