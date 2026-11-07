// O que o administrador decidiu fazer com a foto ao salvar o formulário:
// deixar como está, enviar uma nova ou tirar a atual.
export type AlteracaoDeFoto =
  | { acao: 'manter' }
  | { acao: 'enviar'; arquivo: File }
  | { acao: 'remover' };

export const SEM_ALTERACAO_DE_FOTO: AlteracaoDeFoto = { acao: 'manter' };
