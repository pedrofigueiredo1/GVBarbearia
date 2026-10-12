import { Cartao, TextoCartao } from '@/components/Cartao';
import { ListaDados } from '@/components/ListaDados';
import { useCarregar } from '@/hooks/useCarregar';
import { listarAvaliacoes } from '@/lib/avaliacoes';
import { formatarData, formatarEstrelas } from '@/lib/formatar';

// US Consulta de Avaliações (item 2.45): nota, comentário e autor, das mais
// recentes para as mais antigas. O autor aparece só pelo primeiro nome.
export default function AvaliacoesScreen() {
  const { dados, carregando, erro, recarregar } = useCarregar(listarAvaliacoes);

  return (
    <ListaDados
      dados={dados}
      carregando={carregando}
      erro={erro}
      recarregar={recarregar}
      mensagemVazia="Ainda não há avaliações."
      chave={(avaliacao) => String(avaliacao.id)}
      renderItem={(avaliacao) => (
        <Cartao titulo={avaliacao.autor} destaque={formatarEstrelas(avaliacao.nota)}>
          <TextoCartao>{avaliacao.comentario}</TextoCartao>
          <TextoCartao>
            {avaliacao.servico} com {avaliacao.profissional} - {formatarData(avaliacao.criadoEm)}
          </TextoCartao>
        </Cartao>
      )}
    />
  );
}
