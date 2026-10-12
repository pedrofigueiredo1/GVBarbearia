import { Cartao, TextoCartao } from '@/components/Cartao';
import { ListaDados } from '@/components/ListaDados';
import { useCarregar } from '@/hooks/useCarregar';
import { formatarMoeda } from '@/lib/formatar';
import { listarProdutos } from '@/lib/produtos';

// US Consulta de Produtos (item 2.44): nome, descrição e preço.
export default function ProdutosScreen() {
  const { dados, carregando, erro, recarregar } = useCarregar(listarProdutos);

  return (
    <ListaDados
      dados={dados}
      carregando={carregando}
      erro={erro}
      recarregar={recarregar}
      mensagemVazia="Nenhum produto disponível no momento."
      chave={(produto) => String(produto.id)}
      renderItem={(produto) => (
        <Cartao titulo={produto.nome} destaque={formatarMoeda(produto.preco)}>
          <TextoCartao>{produto.descricao}</TextoCartao>
        </Cartao>
      )}
    />
  );
}
