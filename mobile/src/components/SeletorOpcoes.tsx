import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores, raio } from '@/tema';

interface Opcao {
  id: number;
  titulo: string;
  subtitulo?: string;
}

interface Props {
  rotulo: string;
  opcoes: Opcao[];
  selecionadoId: number | null;
  onSelecionar: (id: number) => void;
}

// Lista de opções de escolha única (ex.: serviço, profissional). A opção
// escolhida fica com borda cobre e marcador preenchido.
export function SeletorOpcoes({ rotulo, opcoes, selecionadoId, onSelecionar }: Props) {
  return (
    <View style={styles.grupo}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      {opcoes.map((opcao) => {
        const selecionada = opcao.id === selecionadoId;
        return (
          <Pressable
            key={opcao.id}
            accessibilityRole="radio"
            accessibilityState={{ selected: selecionada }}
            accessibilityLabel={opcao.titulo}
            onPress={() => onSelecionar(opcao.id)}
            style={[styles.opcao, selecionada && styles.opcaoSelecionada]}
          >
            <View style={styles.textos}>
              <Text style={styles.titulo}>{opcao.titulo}</Text>
              {opcao.subtitulo ? <Text style={styles.subtitulo}>{opcao.subtitulo}</Text> : null}
            </View>
            <Ionicons
              name={selecionada ? 'radio-button-on' : 'radio-button-off'}
              size={22}
              color={selecionada ? cores.cobre : cores.borda}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grupo: { gap: 8 },
  rotulo: { fontSize: 16, fontWeight: '700', color: cores.texto },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio.medio,
    padding: 12,
    backgroundColor: cores.superficie,
  },
  opcaoSelecionada: { borderColor: cores.cobre, backgroundColor: cores.superficieAlta },
  textos: { flex: 1, gap: 2 },
  titulo: { fontSize: 16, fontWeight: '600', color: cores.texto },
  subtitulo: { color: cores.textoSecundario },
});
