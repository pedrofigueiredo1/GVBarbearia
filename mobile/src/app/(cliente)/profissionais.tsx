import { Cartao, TextoCartao } from '@/components/Cartao';
import { ListaDados } from '@/components/ListaDados';
import { useCarregar } from '@/hooks/useCarregar';
import { listarProfissionais } from '@/lib/profissionais';

// US Consulta de Profissionais (item 2.43): nome, especialidade e descrição.
export default function ProfissionaisScreen() {
  const { dados, carregando, erro, recarregar } = useCarregar(listarProfissionais);

  return (
    <ListaDados
      dados={dados}
      carregando={carregando}
      erro={erro}
      recarregar={recarregar}
      mensagemVazia="Nenhum profissional disponível no momento."
      chave={(profissional) => String(profissional.id)}
      renderItem={(profissional) => (
        <Cartao titulo={profissional.nome}>
          <TextoCartao>{profissional.especialidade}</TextoCartao>
          <TextoCartao>{profissional.descricao}</TextoCartao>
        </Cartao>
      )}
    />
  );
}
