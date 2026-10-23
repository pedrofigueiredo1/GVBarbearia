import { Image, StyleSheet, Text, View } from 'react-native';
import { cores } from '@/tema';

interface Props {
  titulo: string;
  subtitulo?: string;
}

// Topo das telas de entrada (login, cadastro, recuperação de senha): a logo
// da barbearia, o título da tela e uma frase de apoio.
export function CabecalhoMarca({ titulo, subtitulo }: Props) {
  return (
    <View style={styles.caixa}>
      <Image
        source={require('../../assets/images/logo.png')}
        style={styles.logo}
        accessibilityLabel="GV Barbearia"
      />
      <Text style={styles.titulo}>{titulo}</Text>
      {subtitulo ? <Text style={styles.subtitulo}>{subtitulo}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  caixa: { alignItems: 'center', gap: 6, marginBottom: 8 },
  logo: { width: 150, height: 150 },
  titulo: { fontSize: 24, fontWeight: '800', color: cores.texto, textAlign: 'center' },
  subtitulo: { color: cores.textoSecundario, textAlign: 'center', lineHeight: 20 },
});
