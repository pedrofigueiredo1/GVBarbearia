import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
        {destaque ? <Text style={[styles.destaque, corDestaque ? { color: corDestaque } : null]}>{destaque}</Text> : null}
      </View>
      {children}
    </View>
  );
}

export function TextoCartao({ children }: { children: ReactNode }) {
  return <Text style={styles.texto}>{children}</Text>;
}

const styles = StyleSheet.create({
  cartao: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 14, gap: 6, backgroundColor: '#fff' },
  cabecalho: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  titulo: { fontSize: 17, fontWeight: '600', flexShrink: 1 },
  destaque: { fontSize: 16, fontWeight: '600' },
  texto: { color: '#444' },
});
