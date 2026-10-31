// ===== CONSULTAR DASHBOARD =====
// Ctrl+F "CONSULTAR DASHBOARD" para achar este bloco.
import { apiFetch } from '../api';
import type { Dashboard } from '@/types/dashboard';

export function consultarDashboard() {
  return apiFetch<Dashboard>('/dashboard');
}
