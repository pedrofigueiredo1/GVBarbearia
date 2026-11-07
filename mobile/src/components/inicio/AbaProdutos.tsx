import { StyleSheet, Text, View } from 'react-native';
import { FotoPadrao } from '@/components/FotoPadrao';
import { formatarMoeda } from '@/lib/formatar';
import { urlDaFoto } from '@/lib/fotos';
import { cores } from '@/tema';
import type { Produto } from '@/types/produto';
import { Carrossel } from './Carrossel';
import { EstadoConsulta, type Consulta } from './EstadoConsulta';

const FOTOS = [require('../../../assets/images/produtos.webp')];

// US Consulta de Produtos (item 2.44): nome, descrição e preço, com a foto da
// estante de produtos da barbearia no topo e a foto de cada produto, cadastrada
// pelo administrador no painel.
export function AbaProdutos({ consulta }: { consulta: Consulta<Produto[]> }) {
  return (
    <View style={styles.aba}>
      <Carrossel fotos={FOTOS} rotulo="Foto da estante de produtos" />
      <EstadoConsulta consulta={consulta} mensagemVazia="Nenhum produto disponível no momento.">
        {(produtos) => (
          <View>
            {produtos.map((produto) => (
              <View key={produto.id} style={styles.linha}>
                <FotoPadrao
                  url={urlDaFoto('produtos', produto.id, produto.fotoAtualizadaEm)}
                  descricao={`Foto de ${produto.nome}`}
                />
                <View style={styles.dados}>
                  <Text style={styles.nome}>{produto.nome}</Text>
                  {produto.descricao ? (
                    <Text style={styles.descricao}>{produto.descricao}</Text>
                  ) : null}
                </View>
                <Text style={styles.preco}>{formatarMoeda(produto.preco)}</Text>
              </View>
            ))}
          </View>
        )}
      </EstadoConsulta>
    </View>
  );
}

const styles = StyleSheet.create({
  aba: { gap: 16 },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },
  dados: { flex: 1, gap: 2 },
  nome: { fontSize: 16, fontWeight: '700', color: cores.texto },
  descricao: { color: cores.textoSecundario, fontSize: 13, lineHeight: 18 },
  preco: { color: cores.cobre, fontWeight: '700', fontSize: 16 },
});
