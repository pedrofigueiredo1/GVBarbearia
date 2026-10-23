import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { cores, raio } from '@/tema';

interface Props {
  titulo: string;
  onPress: () => void;
  carregando?: boolean;
  secundario?: boolean;
  // Versão menor, para botões dentro de listas (ex.: "Agendar" em cada serviço).
  compacto?: boolean;
}

// Botão padrão do app. O primário é cobre, o secundário só tem contorno.
// Enquanto `carregando`, fica desabilitado e mostra o indicador, evitando
// envios duplicados do formulário.
export function Botao({
  titulo,
  onPress,
  carregando = false,
  secundario = false,
  compacto = false,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={titulo}
      onPress={onPress}
      disabled={carregando}
      style={({ pressed }) => [
        styles.botao,
        compacto && styles.compacto,
        secundario && styles.secundario,
        (carregando || pressed) && styles.desabilitado,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={secundario ? cores.cobre : cores.sobreCobre} />
      ) : (
        <Text
          style={[
            styles.texto,
            compacto && styles.textoCompacto,
            secundario && styles.textoSecundario,
          ]}
        >
          {titulo}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    backgroundColor: cores.cobre,
    borderRadius: raio.medio,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: cores.cobre,
  },
  compacto: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: raio.pequeno },
  secundario: { backgroundColor: 'transparent', borderColor: cores.borda },
  desabilitado: { opacity: 0.6 },
  texto: { color: cores.sobreCobre, fontSize: 16, fontWeight: '700' },
  textoCompacto: { fontSize: 14 },
  textoSecundario: { color: cores.texto },
});
