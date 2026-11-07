// ===== FOTOS DE PROFISSIONAIS E PRODUTOS =====
// Ctrl+F "FOTOS DE PROFISSIONAIS E PRODUTOS" para achar este bloco.
// O servidor recorta e reduz toda foto para o mesmo formato (600 x 800, em
// pé), então aqui só se envia o arquivo escolhido.
import { API_URL, apiFetch } from '../api';
import type { AlteracaoDeFoto } from '@/types/foto';

export type RecursoComFoto = 'profissionais' | 'produtos';

export const TIPOS_DE_FOTO_ACEITOS = ['image/jpeg', 'image/png', 'image/webp'];
export const TAMANHO_MAXIMO_DA_FOTO = 8 * 1024 * 1024;

// Endereço da imagem. `fotoAtualizadaEm` vai na URL para o navegador baixar a
// foto de novo só quando ela muda. Sem foto, devolve null.
export function urlDaFoto(
  recurso: RecursoComFoto,
  id: number,
  fotoAtualizadaEm: string | null | undefined,
) {
  if (!fotoAtualizadaEm) return null;
  return `${API_URL}/publico/${recurso}/${id}/foto?v=${encodeURIComponent(fotoAtualizadaEm)}`;
}

export function enviarFoto(recurso: RecursoComFoto, id: number, arquivo: File) {
  const corpo = new FormData();
  corpo.append('foto', arquivo);
  return apiFetch<{ id: number; fotoAtualizadaEm: string }>(`/${recurso}/${id}/foto`, {
    method: 'PUT',
    body: corpo,
  });
}

export function removerFoto(recurso: RecursoComFoto, id: number) {
  return apiFetch<{ id: number }>(`/${recurso}/${id}/foto`, { method: 'DELETE' });
}

// Faz o que o formulário pediu para a foto, depois de o cadastro ser salvo.
export async function aplicarAlteracaoDeFoto(
  recurso: RecursoComFoto,
  id: number,
  alteracao: AlteracaoDeFoto,
) {
  if (alteracao.acao === 'enviar') await enviarFoto(recurso, id, alteracao.arquivo);
  else if (alteracao.acao === 'remover') await removerFoto(recurso, id);
}
