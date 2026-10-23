import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { cores, raio } from '@/tema';

interface Props {
  titulo: string;
  destaque?: string;
  corDestaque?: string;
  children?: ReactNode;
}

// Cartão de item das listagens: título, um destaque à direita (preço, nota...)
// e o conteúdo livre embaixo.
export function Cartao({ titulo, destaque, corDestaque, children }: Props) {
  return (
    <View style={styles.cartao}>
      <View style={styles.cabecalho}>
        <Text style={styles.titulo}>{titulo}</Text>
        {destaque ? (
          <Text style={[styles.destaque, corDestaque ? { color: corDestaque } : null]}>{destaque}</Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

export function TextoCartao({ children }: { children: ReactNode }) {
  return <Text style={styles.texto}>{children}</Text>;
}

const styles = StyleSheet.create({
  cartao: {
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio.medio,
    padding: 14,
    gap: 6,
    backgroundColor: cores.superficie,
  },
  cabecalho: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  titulo: { fontSize: 16, fontWeight: '700', flexShrink: 1, color: cores.texto },
  destaque: { fontSize: 15, fontWeight: '700', color: cores.cobre },
  texto: { color: cores.textoSecundario, lineHeight: 20 },
});
