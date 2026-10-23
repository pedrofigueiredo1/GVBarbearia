import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { cores, raio } from '@/tema';
import type { HorarioDisponivel } from '@/types/agendamento';

interface Props {
  horarios: HorarioDisponivel[];
  // dataHora (ISO) do horário escolhido.
  selecionado: string | null;
  onSelecionar: (dataHora: string) => void;
  carregando?: boolean;
  erro?: string | null;
}

// Grade com os horários livres do dia: um botão por horário, o escolhido em
// cobre. Mostra o motivo quando não há nenhum horário para escolher.
export function SeletorHorarios({
  horarios,
  selecionado,
  onSelecionar,
  carregando = false,
  erro = null,
}: Props) {
  if (carregando) {
    return (
      <View style={styles.aviso}>
        <ActivityIndicator color={cores.cobre} />
      </View>
    );
  }

  if (erro) {
    return (
      <View style={styles.aviso}>
        <Text style={styles.erro}>{erro}</Text>
      </View>
    );
  }

  if (horarios.length === 0) {
    return (
      <View style={styles.aviso}>
        <Text style={styles.vazio}>Não há horários livres neste dia. Escolha outra data.</Text>
      </View>
    );
  }

  return (
    <View style={styles.grade}>
      {horarios.map((horario) => {
        const escolhido = horario.dataHora === selecionado;
        return (
          <Pressable
            key={horario.dataHora}
            accessibilityRole="radio"
            accessibilityState={{ selected: escolhido }}
            accessibilityLabel={`Horário ${horario.hora}`}
            onPress={() => onSelecionar(horario.dataHora)}
            style={[styles.horario, escolhido && styles.horarioEscolhido]}
          >
            <Text style={[styles.texto, escolhido && styles.textoEscolhido]}>{horario.hora}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  horario: {
    width: '23%',
    alignItems: 'center',
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio.medio,
    backgroundColor: cores.superficie,
  },
  horarioEscolhido: { backgroundColor: cores.cobre, borderColor: cores.cobre },
  texto: { color: cores.texto, fontSize: 15, fontWeight: '600' },
  textoEscolhido: { color: cores.sobreCobre, fontWeight: '800' },
  aviso: { paddingVertical: 16, alignItems: 'center' },
  vazio: { color: cores.textoSecundario, textAlign: 'center' },
  erro: { color: cores.erro, textAlign: 'center' },
});
