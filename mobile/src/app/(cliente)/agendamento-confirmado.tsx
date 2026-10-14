import { StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Botao } from '@/components/Botao';
import { Cartao, TextoCartao } from '@/components/Cartao';
import { formatarData, formatarDuracao, formatarHora, formatarMoeda } from '@/lib/formatar';
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
        <Text style={styles.erro}>Não foi possível exibir os dados do agendamento.</Text>
        <Botao titulo="Voltar para o início" onPress={() => router.replace('/')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 14, justifyContent: 'center' },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  titulo: { fontSize: 24, fontWeight: '700', textAlign: 'center' },
  aviso: { textAlign: 'center', color: '#555' },
  erro: { color: '#c00', textAlign: 'center' },
});
