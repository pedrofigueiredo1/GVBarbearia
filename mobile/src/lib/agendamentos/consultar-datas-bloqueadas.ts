// ===== CONSULTAR DATAS BLOQUEADAS =====
// Ctrl+F "CONSULTAR DATAS BLOQUEADAS" para achar este bloco.
// Dias em que o profissional não atende (folga, férias, feriado), para o
// calendário de agendamento apagar esses dias.
import { apiFetch } from '../api';
import type { DatasBloqueadas } from '@/types/agendamento';

export function consultarDatasBloqueadas(profissionalId: number) {
  return apiFetch<DatasBloqueadas>(
    `/meus-agendamentos/datas-bloqueadas?profissionalId=${profissionalId}`,
  );
}
