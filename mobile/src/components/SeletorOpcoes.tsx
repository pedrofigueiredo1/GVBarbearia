import { Pressable, StyleSheet, Text, View } from 'react-native';

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
// escolhida fica com borda destacada.
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
            <Text style={styles.titulo}>{opcao.titulo}</Text>
            {opcao.subtitulo ? <Text style={styles.subtitulo}>{opcao.subtitulo}</Text> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grupo: { gap: 8 },
  rotulo: { fontSize: 16, fontWeight: '700' },
  opcao: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, gap: 2, backgroundColor: '#fff' },
  opcaoSelecionada: { borderColor: '#222', borderWidth: 2, backgroundColor: '#f2f2f2' },
  titulo: { fontSize: 16, fontWeight: '600' },
  subtitulo: { color: '#555' },
});
