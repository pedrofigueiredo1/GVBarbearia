import { useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { cores, raio } from '@/tema';

interface Props {
  fotos: ImageSourcePropType[];
  rotulo: string;
}

// Todas as imagens das abas têm o mesmo tamanho: largura dividida pela altura.
const PROPORCAO = 0.9;

// As abas da Home têm 16 de margem de cada lado.
const MARGEM_TOTAL = 32;

// Fotos deslizando de lado, com os pontinhos de posição embaixo. Com uma
// foto só, vira uma imagem fixa, sem pontinhos.
export function Carrossel({ fotos, rotulo }: Props) {
  const { width } = useWindowDimensions();
  const largura = width - MARGEM_TOTAL;
  const altura = Math.round(largura / PROPORCAO);
  const [atual, setAtual] = useState(0);

  return (
    <View style={styles.caixa}>
      <ScrollView
        horizontal
        pagingEnabled
        scrollEnabled={fotos.length > 1}
        showsHorizontalScrollIndicator={false}
        style={{ width: largura }}
        onMomentumScrollEnd={(evento) =>
          setAtual(Math.round(evento.nativeEvent.contentOffset.x / largura))
        }
      >
        {fotos.map((foto, indice) => (
          <Image
            key={indice}
            source={foto}
            style={{ width: largura, height: altura }}
            resizeMode="cover"
            accessibilityLabel={`${rotulo} ${indice + 1}`}
          />
        ))}
      </ScrollView>
      {fotos.length > 1 && (
        <View style={styles.pontos}>
          {fotos.map((_, indice) => (
            <View key={indice} style={[styles.ponto, indice === atual && styles.pontoAtivo]} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  caixa: {
    borderRadius: raio.grande,
    overflow: 'hidden',
    backgroundColor: cores.superficie,
  },
  pontos: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  ponto: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.45)' },
  pontoAtivo: { backgroundColor: cores.cobre, width: 18 },
});
