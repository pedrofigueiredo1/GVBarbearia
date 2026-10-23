import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Estrelas } from '@/components/Estrelas';
import { formatarData } from '@/lib/formatar';
import { cores, raio } from '@/tema';
import type { AvaliacaoPublica } from '@/types/avaliacao';
import { Carrossel } from './Carrossel';
import { EstadoConsulta, type Consulta } from './EstadoConsulta';

// Exemplos de avaliações de clientes da barbearia.
const FOTOS_AVALIACOES = [
  require('../../../assets/images/avaliacao-1.jpg'),
  require('../../../assets/images/avaliacao-2.jpg'),
  require('../../../assets/images/avaliacao-3.jpg'),
  require('../../../assets/images/avaliacao-4.jpg'),
];

// US Consulta de Avaliações (item 2.45): nota, comentário e autor, das mais
// recentes para as mais antigas. O autor aparece só pelo primeiro nome.
export function AbaAvaliacoes({ consulta }: { consulta: Consulta<AvaliacaoPublica[]> }) {
  return (
    <View style={styles.aba}>
      <Carrossel fotos={FOTOS_AVALIACOES} rotulo="Exemplo de avaliação" />
      <EstadoConsulta consulta={consulta} mensagemVazia="Ainda não há avaliações.">
        {(avaliacoes) => {
          const media = avaliacoes.reduce((soma, a) => soma + a.nota, 0) / avaliacoes.length;
          return (
            <View style={styles.bloco}>
              <View style={styles.resumo}>
                <Text style={styles.media}>{media.toFixed(1).replace('.', ',')}</Text>
                <View style={styles.resumoDireita}>
                  <Estrelas nota={Math.round(media)} tamanho={20} />
                  <Text style={styles.total}>
                    {avaliacoes.length} {avaliacoes.length === 1 ? 'avaliação' : 'avaliações'}
                  </Text>
                </View>
              </View>

              {avaliacoes.map((avaliacao) => (
                <View key={avaliacao.id} style={styles.cartao}>
                  <View style={styles.cabecalho}>
                    <View style={styles.autor}>
                      <Ionicons name="person-circle-outline" size={28} color={cores.cobre} />
                      <Text style={styles.nome}>{avaliacao.autor}</Text>
                    </View>
                    <Estrelas nota={avaliacao.nota} tamanho={16} />
                  </View>
                  <Text style={styles.comentario}>{avaliacao.comentario}</Text>
                  <Text style={styles.detalhe}>
                    {avaliacao.servico} com {avaliacao.profissional} -{' '}
                    {formatarData(avaliacao.criadoEm)}
                  </Text>
                </View>
              ))}
            </View>
          );
        }}
      </EstadoConsulta>
    </View>
  );
}

const styles = StyleSheet.create({
  aba: { gap: 16 },
  bloco: { gap: 12 },
  resumo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio.grande,
    padding: 16,
  },
  media: { fontSize: 44, fontWeight: '800', color: cores.cobre },
  resumoDireita: { gap: 4 },
  total: { color: cores.textoSecundario },
  cartao: {
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio.medio,
    padding: 14,
    gap: 8,
  },
  cabecalho: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  autor: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nome: { fontWeight: '700', color: cores.texto, fontSize: 15 },
  comentario: { color: cores.texto, lineHeight: 21 },
  detalhe: { color: cores.textoSecundario, fontSize: 13 },
});
