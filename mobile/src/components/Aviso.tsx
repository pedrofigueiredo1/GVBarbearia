import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores, raio } from '@/tema';

interface Props {
  tipo: 'erro' | 'sucesso' | 'info';
  texto: string;
}

const ICONE = {
  erro: 'alert-circle',
  sucesso: 'checkmark-circle',
  info: 'information-circle',
} as const;

const COR = { erro: cores.erro, sucesso: cores.sucesso, info: cores.cobre } as const;
const FUNDO = { erro: cores.fundoErro, sucesso: cores.fundoSucesso, info: cores.superficie } as const;

// Caixa de mensagem (erro, sucesso ou informação) usada em formulários e listas.
export function Aviso({ tipo, texto }: Props) {
  return (
    <View style={[styles.caixa, { backgroundColor: FUNDO[tipo], borderColor: COR[tipo] }]}>
      <Ionicons name={ICONE[tipo]} size={20} color={COR[tipo]} />
      <Text style={[styles.texto, { color: COR[tipo] === cores.cobre ? cores.texto : COR[tipo] }]}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  caixa: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderWidth: 1,
    borderRadius: raio.medio,
    padding: 12,
  },
  texto: { flex: 1, lineHeight: 20 },
});
