import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { cores } from '@/tema';

interface Props<T extends string> {
  abas: readonly T[];
  ativa: T;
  onSelecionar: (aba: T) => void;
}

// Abas horizontais da Home (Serviços, Profissionais...): a ativa fica em
// destaque com um traço cobre embaixo.
export function Abas<T extends string>({ abas, ativa, onSelecionar }: Props<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.lista}
      style={styles.faixa}
    >
      {abas.map((aba) => {
        const selecionada = aba === ativa;
        return (
          <Pressable
            key={aba}
            accessibilityRole="tab"
            accessibilityState={{ selected: selecionada }}
            accessibilityLabel={aba}
            onPress={() => onSelecionar(aba)}
            style={[styles.aba, selecionada && styles.abaAtiva]}
          >
            <Text style={[styles.texto, selecionada && styles.textoAtivo]}>{aba}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  faixa: { borderBottomWidth: 1, borderBottomColor: cores.borda, flexGrow: 0 },
  lista: { paddingHorizontal: 16, gap: 22 },
  aba: { paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  abaAtiva: { borderBottomColor: cores.cobre },
  texto: { fontSize: 16, fontWeight: '600', color: cores.textoSecundario },
  textoAtivo: { color: cores.cobre },
});
