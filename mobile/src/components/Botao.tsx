import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

interface Props {
  titulo: string;
  onPress: () => void;
  carregando?: boolean;
  secundario?: boolean;
}

// Botão padrão do app. Enquanto `carregando`, fica desabilitado e mostra o
// indicador, evitando envios duplicados do formulário.
export function Botao({ titulo, onPress, carregando = false, secundario = false }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={titulo}
      onPress={onPress}
      disabled={carregando}
      style={[styles.botao, secundario && styles.secundario, carregando && styles.desabilitado]}
    >
      {carregando ? (
        <ActivityIndicator color={secundario ? '#222' : '#fff'} />
      ) : (
        <Text style={[styles.texto, secundario && styles.textoSecundario]}>{titulo}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    backgroundColor: '#222',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222',
  },
  secundario: { backgroundColor: '#fff' },
  desabilitado: { opacity: 0.6 },
  texto: { color: '#fff', fontSize: 16, fontWeight: '600' },
  textoSecundario: { color: '#222' },
});
