import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/components/Avatar';
import { cores, raio } from '@/tema';

// Tamanho único das fotos de barbeiros e produtos no app: 84 x 112 (3:4, em
// pé), a mesma proporção em que o servidor recorta toda foto enviada pelo
// painel. Assim nenhuma fica maior que a outra.
export const LARGURA_FOTO = 84;
export const ALTURA_FOTO = 112;

interface Props {
  // Endereço da foto; sem ele (ou se a imagem não carregar), mostra o espaço padrão.
  url: string | null;
  descricao: string;
  // Com nome, o espaço padrão mostra as iniciais; sem nome, o ícone de produto.
  nome?: string;
}

export function FotoPadrao({ url, descricao, nome }: Props) {
  const [falhou, setFalhou] = useState(false);

  if (url && !falhou) {
    return (
      <Image
        source={{ uri: url }}
        style={styles.quadro}
        resizeMode="cover"
        accessibilityLabel={descricao}
        onError={() => setFalhou(true)}
      />
    );
  }

  return (
    <View style={[styles.quadro, styles.semFoto]} accessibilityLabel={`${descricao} (sem foto)`}>
      {nome ? (
        <Avatar nome={nome} tamanho={56} />
      ) : (
        <Ionicons name="bag-handle-outline" size={32} color={cores.cobre} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  quadro: {
    width: LARGURA_FOTO,
    height: ALTURA_FOTO,
    borderRadius: raio.medio,
    backgroundColor: cores.superficie,
  },
  semFoto: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficieAlta,
  },
});
