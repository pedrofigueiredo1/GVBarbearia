export interface Barbearia {
  id: number;
  nome: string;
  endereco: string;
  telefone: string;
  horarioFuncionamento: string;
  atualizadoEm: string;
}

// Formato enviado ao salvar — sem os campos gerados pelo banco.
export interface BarbeariaInput {
  nome: string;
  endereco: string;
  telefone: string;
  horarioFuncionamento: string;
}
