import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Aviso } from '@/components/Aviso';
import { Botao } from '@/components/Botao';
import { Cartao, TextoCartao } from '@/components/Cartao';
import { formatarData, formatarDuracao, formatarHora, formatarMoeda } from '@/lib/formatar';
import { cores } from '@/tema';
import { STATUS_LABEL, type Agendamento } from '@/types/agendamento';

// US Confirmação de Agendamento (item 2.50): mostra os dados do agendamento
// que foi salvo (a tela recebe exatamente o que o backend devolveu). Como o
// agendamento nasce PENDENTE, avisa que depende da confirmação da barbearia.
export default function AgendamentoConfirmadoScreen() {
  const { dados } = useLocalSearchParams<{ dados?: string }>();

  let agendamento: Agendamento | null = null;
  try {
    agendamento = dados ? (JSON.parse(dados) as Agendamento) : null;
  } catch {
    agendamento = null;
  }

  if (!agendamento) {
    return (
      <View style={styles.centro}>
        <Aviso tipo="erro" texto="Não foi possível exibir os dados do agendamento." />
        <Botao titulo="Voltar para o início" onPress={() => router.replace('/')} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.selo}>
        <Ionicons name="checkmark" size={44} color={cores.sobreCobre} />
      </View>
      <Text style={styles.titulo}>Agendamento realizado!</Text>
      <Text style={styles.aviso}>
        Seu horário foi reservado e está aguardando a confirmação da barbearia.
      </Text>

      <Cartao titulo={agendamento.servico.nome} destaque={formatarMoeda(agendamento.servico.valor)}>
        <TextoCartao>Profissional: {agendamento.profissional.nome}</TextoCartao>
        <TextoCartao>Data: {formatarData(agendamento.dataHora)}</TextoCartao>
        <TextoCartao>Horário: {formatarHora(agendamento.dataHora)}</TextoCartao>
        <TextoCartao>Duração: {formatarDuracao(agendamento.servico.duracaoMinutos)}</TextoCartao>
        <TextoCartao>Situação: {STATUS_LABEL[agendamento.status]}</TextoCartao>
      </Cartao>

      <Botao titulo="Ver meus agendamentos" onPress={() => router.replace('/meus-agendamentos')} />
      <Botao titulo="Voltar para o início" secundario onPress={() => router.replace('/')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, gap: 14, justifyContent: 'center' },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
    backgroundColor: cores.fundo,
  },
  selo: {
    alignSelf: 'center',
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.cobre,
  },
  titulo: { fontSize: 24, fontWeight: '800', textAlign: 'center', color: cores.texto },
  aviso: { textAlign: 'center', color: cores.textoSecundario, lineHeight: 21 },
});
