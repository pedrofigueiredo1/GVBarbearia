// ===== EDITAR PERFIL =====
// Ctrl+F "EDITAR PERFIL" para achar este bloco.
// US "Visualização e Edição de Perfil do Cliente" (item 2.55). Trocar o
// e-mail ou a senha exige a senha atual; e-mail já usado por outro cliente é
// recusado pelo backend.
import { apiFetch } from '../api';
import type { EditarPerfilInput, Perfil } from '@/types/cliente';

export function editarPerfil(data: EditarPerfilInput) {
  return apiFetch<Perfil>('/meu-perfil', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
