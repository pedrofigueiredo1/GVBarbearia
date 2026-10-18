// ===== CONSULTAR PERFIL =====
// Ctrl+F "CONSULTAR PERFIL" para achar este bloco.
// US "Visualização e Edição de Perfil do Cliente" (item 2.55): os dados do
// próprio cliente logado.
import { apiFetch } from '../api';
import type { Perfil } from '@/types/cliente';

export function consultarPerfil() {
  return apiFetch<Perfil>('/meu-perfil');
}
