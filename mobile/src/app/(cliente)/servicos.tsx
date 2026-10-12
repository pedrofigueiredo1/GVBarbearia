import { Cartao, TextoCartao } from '@/components/Cartao';
import { ListaDados } from '@/components/ListaDados';
import { useCarregar } from '@/hooks/useCarregar';
import { formatarDuracao, formatarMoeda } from '@/lib/formatar';
import { listarServicos } from '@/lib/servicos';

// US Consulta de Serviços (item 2.42): nome, descrição, valor e duração.
export default function ServicosScreen() {
  const { dados, carregando, erro, recarregar } = useCarregar(listarServicos);

  return (
    <ListaDados
      dados={dados}
      carregando={carregando}
      erro={erro}
      recarregar={recarregar}
      mensagemVazia="Nenhum serviço disponível no momento."
      chave={(servico) => String(servico.id)}
      renderItem={(servico) => (
        <Cartao titulo={servico.nome} destaque={formatarMoeda(servico.valor)}>
          <TextoCartao>{servico.descricao}</TextoCartao>
          <TextoCartao>Duração: {formatarDuracao(servico.duracaoMinutos)}</TextoCartao>
        </Cartao>
      )}
    />
  );
}
