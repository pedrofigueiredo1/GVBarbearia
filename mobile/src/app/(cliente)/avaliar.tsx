import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Aviso } from '@/components/Aviso';
import { Botao } from '@/components/Botao';
import { CampoTexto } from '@/components/CampoTexto';
import { Tela } from '@/components/Tela';
import { ApiError } from '@/lib/api';
import { adicionarAvaliacao } from '@/lib/avaliacoes';
import { cores } from '@/tema';

const NOTAS = [1, 2, 3, 4, 5];

// US Cadastro de Avaliação (item 2.54): nota de 1 a 5 e comentário sobre um
// atendimento concluído. Nota em branco não é aceita (CT02). O backend também
// confere que o atendimento é do cliente, está concluído e ainda não foi avaliado.
export default function AvaliarScreen() {
  const { agendamentoId, resumo } = useLocalSearchParams<{ agendamentoId?: string; resumo?: string }>();
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleEnviar() {
    setErro(null);
    if (nota === 0) {
      setErro('Escolha uma nota de 1 a 5.');
      return;
    }
    if (!comentario.trim()) {
      setErro('Escreva um comentário sobre o atendimento.');
      return;
    }

    setEnviando(true);
    try {
      await adicionarAvaliacao({
        agendamentoId: Number(agendamentoId),
        nota,
        comentario: comentario.trim(),
      });
      Alert.alert('Avaliação enviada', 'Obrigado pela sua opinião!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível enviar. Verifique sua conexão com a internet.',
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Tela>
      <Text style={styles.titulo}>Como foi o atendimento?</Text>
      {resumo ? <Text style={styles.resumo}>{resumo}</Text> : null}

      <View style={styles.estrelas}>
        {NOTAS.map((valor) => (
          <Pressable
            key={valor}
            accessibilityRole="radio"
            accessibilityState={{ selected: valor === nota }}
            accessibilityLabel={`${valor} ${valor === 1 ? 'estrela' : 'estrelas'}`}
            onPress={() => setNota(valor)}
            hitSlop={6}
          >
            <Ionicons
              name={valor <= nota ? 'star' : 'star-outline'}
              size={46}
              color={valor <= nota ? cores.cobre : cores.borda}
            />
          </Pressable>
        ))}
      </View>
      <Text style={styles.legenda}>{nota === 0 ? 'Toque nas estrelas para dar a sua nota' : `Nota: ${nota} de 5`}</Text>

      <CampoTexto
        rotulo="Comentário"
        value={comentario}
        onChangeText={setComentario}
        multiline
        numberOfLines={4}
        maxLength={1000}
        textAlignVertical="top"
        style={styles.comentario}
      />

      {erro && <Aviso tipo="erro" texto={erro} />}

      <Botao titulo="Enviar avaliação" onPress={handleEnviar} carregando={enviando} />
    </Tela>
  );
}

const styles = StyleSheet.create({
  titulo: { fontSize: 22, fontWeight: '800', textAlign: 'center', color: cores.texto },
  resumo: { textAlign: 'center', color: cores.textoSecundario },
  estrelas: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 8 },
  legenda: { textAlign: 'center', color: cores.textoSecundario },
  comentario: { minHeight: 110 },
});
