import { apiFetch } from './api';
import type { Barbearia, BarbeariaInput } from '@/types/barbearia';

// Retorna null quando ainda não há informações cadastradas (US Consulta,
// CT02) — não é um erro, é um estado normal a ser exibido na tela.
export function consultarBarbearia() {
  return apiFetch<Barbearia | null>('/barbearia');
}

export function salvarBarbearia(data: BarbeariaInput) {
  return apiFetch<Barbearia>('/barbearia', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
