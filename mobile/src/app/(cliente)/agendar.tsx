import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { Botao } from '@/components/Botao';
import { SeletorOpcoes } from '@/components/SeletorOpcoes';
import { useCarregar } from '@/hooks/useCarregar';
import { ApiError } from '@/lib/api';
import { adicionarAgendamento } from '@/lib/agendamentos';
import { formatarData, formatarDuracao, formatarHora, formatarMoeda } from '@/lib/formatar';
import { listarProfissionais } from '@/lib/profissionais';
import { listarServicos } from '@/lib/servicos';

// Junta o dia escolhido com a hora escolhida (cada um vem de um seletor).
function combinar(data: Date, hora: Date) {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate(), hora.getHours(), hora.getMinutes());
}

// US Seleção de Serviço, Profissional e Data/Horário (itens 2.46 a 2.48) e
// Cadastro de Agendamento (item 2.49), numa tela só. Depois de confirmar, o
// agendamento fica PENDENTE até a barbearia confirmar.
export default function AgendarScreen() {
  const servicos = useCarregar(listarServicos);
  const profissionais = useCarregar(listarProfissionais);

  const [servicoId, setServicoId] = useState<number | null>(null);
  const [profissionalId, setProfissionalId] = useState<number | null>(null);
  const [data, setData] = useState<Date | null>(null);
  const [hora, setHora] = useState<Date | null>(null);
  const [mostrarData, setMostrarData] = useState(false);
  const [mostrarHora, setMostrarHora] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function aoEscolherData(escolhida: Date) {
    setMostrarData(false);
    setData(escolhida);
  }

  function aoEscolherHora(escolhida: Date) {
    setMostrarHora(false);
    setHora(escolhida);
  }

  function recarregar() {
    servicos.recarregar();
    profissionais.recarregar();
  }

  async function handleConfirmar() {
    setErro(null);
    if (servicoId === null || profissionalId === null || !data || !hora) {
      setErro('Escolha o serviço, o profissional, a data e o horário.');
      return;
    }
    const quando = combinar(data, hora);
    if (quando <= new Date()) {
      setErro('Escolha uma data e um horário futuros.');
      return;
    }

    setEnviando(true);
    try {
      const agendamento = await adicionarAgendamento({
        servicoId,
        profissionalId,
        dataHora: quando.toISOString(),
      });
      router.replace({
        pathname: '/agendamento-confirmado',
        params: { dados: JSON.stringify(agendamento) },
      });
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível agendar. Verifique sua conexão com a internet.',
      );
    } finally {
      setEnviando(false);
    }
  }

  const primeiraCarga =
    (servicos.carregando && servicos.dados === null) ||
    (profissionais.carregando && profissionais.dados === null);
  const falhaNaCarga = servicos.erro ?? profissionais.erro;

  if (primeiraCarga && !falhaNaCarga) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (falhaNaCarga) {
    return (
      <View style={styles.centro}>
        <Text style={styles.erro}>{falhaNaCarga}</Text>
        <Botao titulo="Tentar novamente" onPress={recarregar} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.conteudo}>
      <SeletorOpcoes
        rotulo="1. Serviço"
        opcoes={(servicos.dados ?? []).map((servico) => ({
          id: servico.id,
          titulo: servico.nome,
          subtitulo: `${formatarMoeda(servico.valor)} - ${formatarDuracao(servico.duracaoMinutos)}`,
        }))}
        selecionadoId={servicoId}
        onSelecionar={setServicoId}
      />

      <SeletorOpcoes
        rotulo="2. Profissional"
        opcoes={(profissionais.dados ?? []).map((profissional) => ({
          id: profissional.id,
          titulo: profissional.nome,
          subtitulo: profissional.especialidade,
        }))}
        selecionadoId={profissionalId}
        onSelecionar={setProfissionalId}
      />

      <View style={styles.grupo}>
        <Text style={styles.rotulo}>3. Data e horário</Text>
        <View style={styles.linha}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Escolher data"
            onPress={() => setMostrarData(true)}
            style={styles.campoData}
          >
            <Text style={styles.campoRotulo}>Data</Text>
            <Text style={styles.campoValor}>{data ? formatarData(data.toISOString()) : 'Escolher'}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Escolher horário"
            onPress={() => setMostrarHora(true)}
            style={styles.campoData}
          >
            <Text style={styles.campoRotulo}>Horário</Text>
            <Text style={styles.campoValor}>{hora ? formatarHora(hora) : 'Escolher'}</Text>
          </Pressable>
        </View>
      </View>

      {mostrarData && (
        <DateTimePicker
          value={data ?? new Date()}
          mode="date"
          minimumDate={new Date()}
          onValueChange={(_evento, escolhida) => aoEscolherData(escolhida)}
          onDismiss={() => setMostrarData(false)}
        />
      )}
      {mostrarHora && (
        <DateTimePicker
          value={hora ?? new Date()}
          mode="time"
          is24Hour
          onValueChange={(_evento, escolhida) => aoEscolherHora(escolhida)}
          onDismiss={() => setMostrarHora(false)}
        />
      )}

      {erro && <Text style={styles.erro}>{erro}</Text>}

      <Botao titulo="Confirmar agendamento" onPress={handleConfirmar} carregando={enviando} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  conteudo: { padding: 16, gap: 20 },
  grupo: { gap: 8 },
  rotulo: { fontSize: 16, fontWeight: '700' },
  linha: { flexDirection: 'row', gap: 10 },
  campoData: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, gap: 2, backgroundColor: '#fff' },
  campoRotulo: { color: '#555', fontSize: 13 },
  campoValor: { fontSize: 17, fontWeight: '600' },
  erro: { color: '#c00' },
});
