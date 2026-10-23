import { Image, StyleSheet, Text, View } from 'react-native';
import { cores } from '@/tema';

interface Props {
  // Com nome, mostra as iniciais; sem nome, mostra o monograma da barbearia.
  nome?: string;
  tamanho?: number;
}

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  const primeira = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (primeira + ultima).toUpperCase();
}

// Círculo com contorno cobre, como os avatares das listas de barbearia.
export function Avatar({ nome, tamanho = 56 }: Props) {
  const medidas = { width: tamanho, height: tamanho, borderRadius: tamanho / 2 };

  return (
    <View style={[styles.circulo, medidas]}>
      {nome ? (
        <Text style={[styles.iniciais, { fontSize: tamanho * 0.34 }]}>{iniciais(nome)}</Text>
      ) : (
        <Image
          source={require('../../assets/images/monograma.png')}
          style={{ width: tamanho * 0.55, height: tamanho * 0.55 }}
          resizeMode="contain"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  circulo: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.superficieAlta,
    borderWidth: 1,
    borderColor: cores.cobre,
  },
  iniciais: { color: cores.cobre, fontWeight: '700' },
});
