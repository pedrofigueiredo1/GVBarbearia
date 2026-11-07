// ===== FOTOS DE PROFISSIONAIS E PRODUTOS =====
// Ctrl+F "FOTOS DE PROFISSIONAIS E PRODUTOS" para achar este bloco.
// As fotos são cadastradas pelo administrador no painel e vêm da API. O
// servidor já entrega todas no mesmo formato (600 x 800, em pé).
import { API_URL } from './api';

export type RecursoComFoto = 'profissionais' | 'produtos';

// Endereço da imagem, ou null se o cadastro não tem foto. `fotoAtualizadaEm`
// vai na URL para a foto ser baixada de novo só quando ela muda.
export function urlDaFoto(
  recurso: RecursoComFoto,
  id: number,
  fotoAtualizadaEm: string | null | undefined,
) {
  if (!fotoAtualizadaEm) return null;
  return `${API_URL}/publico/${recurso}/${id}/foto?v=${encodeURIComponent(fotoAtualizadaEm)}`;
}
