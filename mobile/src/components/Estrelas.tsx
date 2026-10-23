import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores } from '@/tema';

interface Props {
  nota: number;
  tamanho?: number;
}

// Cinco estrelas, as da nota preenchidas em cobre e as demais só no contorno.
export function Estrelas({ nota, tamanho = 18 }: Props) {
  return (
    <View style={styles.linha} accessibilityLabel={`Nota ${nota} de 5`}>
      {[1, 2, 3, 4, 5].map((valor) => (
        <Ionicons
          key={valor}
          name={valor <= nota ? 'star' : 'star-outline'}
          size={tamanho}
          color={valor <= nota ? cores.cobre : cores.borda}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', gap: 2 },
});
