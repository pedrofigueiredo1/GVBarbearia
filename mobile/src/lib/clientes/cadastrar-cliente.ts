// ===== CADASTRAR CLIENTE =====
// Ctrl+F "CADASTRAR CLIENTE" para achar este bloco.
// US "Cadastro de Cliente" (item 2.37): rota pública, não exige login.
import { apiFetch } from '../api';
import type { CadastroClienteInput, ClienteLogado } from '@/types/cliente';

export function cadastrarCliente(data: CadastroClienteInput) {
  return apiFetch<ClienteLogado>('/publico/clientes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
