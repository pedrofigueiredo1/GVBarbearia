import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, SectionList, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Botao } from '@/components/Botao';
import { Cartao, TextoCartao } from '@/components/Cartao';
import { useCarregar } from '@/hooks/useCarregar';
import { ApiError } from '@/lib/api';
import { cancelarAgendamento, listarAgendamentos } from '@/lib/agendamentos';
import { formatarData, formatarHora, formatarMoeda } from '@/lib/formatar';
import { STATUS_LABEL, type Agendamento, type StatusAgendamento } from '@/types/agendamento';

// US Cancelamento de Agendamento pelo Cliente (item 2.53): só com no mínimo
// 2 horas de antecedência. O backend é quem garante a regra; aqui ela só
// evita mostrar um botão que seria recusado.
const ANTECEDENCIA_MINIMA_MS = 2 * 60 * 60 * 1000;

const COR_STATUS: Record<StatusAgendamento, string> = {
  PENDENTE: '#9a6700',
  CONFIRMADO: '#0a6b2d',
  CONCLUIDO: '#444',
  CANCELADO: '#b00020',
};

const STATUS_ATIVOS: StatusAgendamento[] = ['PENDENTE', 'CONFIRMADO'];

type Mensagem = { tipo: 'sucesso' | 'erro'; texto: string };

// US Consulta de Agendamento do cliente (item 2.52): os próximos primeiro
// (do mais perto ao mais longe) e, depois, o histórico (do mais recente ao
// mais antigo), com a situação de cada um.
export default function MeusAgendamentosScreen() {
  const { dados, carregando, erro, recarregar } = useCarregar(listarAgendamentos);
  const [cancelandoId, setCancelandoId] = useState<number | null>(null);
  const [mensagem, setMensagem] = useState<Mensagem | null>(null);

  const secoes = useMemo(() => {
    const agora = Date.now();
    const lista = dados ?? [];
    const proximos = lista
      .filter((a) => STATUS_ATIVOS.includes(a.status) && new Date(a.dataHora).getTime() > agora)
      .sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime());
    const historico = lista
      .filter((a) => !proximos.includes(a))
      .sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime());
    return [
      { titulo: 'Próximos', proximo: true, data: proximos },
      { titulo: 'Histórico', proximo: false, data: historico },
    ].filter((secao) => secao.data.length > 0);
  }, [dados]);

  function pedirConfirmacao(agendamento: Agendamento) {
    Alert.alert(
      'Cancelar agendamento?',
      `${agendamento.servico.nome} com ${agendamento.profissional.nome}, em ${formatarData(agendamento.dataHora)} às ${formatarHora(agendamento.dataHora)}. Essa ação não pode ser desfeita.`,
      [
        { text: 'Voltar', style: 'cancel' },
        { text: 'Sim, cancelar', style: 'destructive', onPress: () => cancelar(agendamento) },
      ],
    );
  }

  async function cancelar(agendamento: Agendamento) {
    setMensagem(null);
    setCancelandoId(agendamento.id);
    try {
      await cancelarAgendamento(agendamento.id);
      setMensagem({ tipo: 'sucesso', texto: 'Agendamento cancelado. O horário foi liberado.' });
    } catch (err) {
      setMensagem({
        tipo: 'erro',
        texto:
          err instanceof ApiError
            ? err.message
            : 'Não foi possível cancelar. Verifique sua conexão com a internet.',
      });
    } finally {
      setCancelandoId(null);
      recarregar();
    }
  }

  if (carregando && dados === null) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (erro && dados === null) {
    return (
      <View style={styles.centro}>
        <Text style={styles.erro}>{erro}</Text>
        <Botao titulo="Tentar novamente" onPress={recarregar} />
      </View>
    );
  }

  return (
    <SectionList
      sections={secoes}
      keyExtractor={(agendamento) => String(agendamento.id)}
      contentContainerStyle={styles.lista}
      refreshControl={<RefreshControl refreshing={carregando} onRefresh={recarregar} />}
      stickySectionHeadersEnabled={false}
      ListHeaderComponent={
        mensagem ? (
          <Text style={mensagem.tipo === 'sucesso' ? styles.sucesso : styles.erro}>{mensagem.texto}</Text>
        ) : null
      }
      ListEmptyComponent={
        <View style={styles.vazio}>
          <Text style={styles.textoVazio}>Você ainda não tem agendamentos.</Text>
          <Botao titulo="Agendar horário" onPress={() => router.push('/agendar')} />
        </View>
      }
      renderSectionHeader={({ section }) => <Text style={styles.secao}>{section.titulo}</Text>}
      renderItem={({ item, section }) => {
        const antecedencia = new Date(item.dataHora).getTime() - Date.now();
        const podeCancelar = section.proximo && antecedencia >= ANTECEDENCIA_MINIMA_MS;
        return (
          <View style={styles.item}>
            <Cartao
              titulo={item.servico.nome}
              destaque={STATUS_LABEL[item.status]}
              corDestaque={COR_STATUS[item.status]}
            >
              <TextoCartao>Profissional: {item.profissional.nome}</TextoCartao>
              <TextoCartao>
                {formatarData(item.dataHora)} às {formatarHora(item.dataHora)}
              </TextoCartao>
              <TextoCartao>Valor: {formatarMoeda(item.servico.valor)}</TextoCartao>
              {section.proximo && podeCancelar && (
                <View style={styles.acao}>
                  <Botao
                    titulo="Cancelar agendamento"
                    secundario
                    carregando={cancelandoId === item.id}
                    onPress={() => pedirConfirmacao(item)}
                  />
                </View>
              )}
              {section.proximo && !podeCancelar && (
                <Text style={styles.prazo}>
                  O cancelamento pelo app só é possível até 2 horas antes do horário.
                </Text>
              )}
            </Cartao>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  lista: { padding: 16, gap: 4 },
  secao: { fontSize: 18, fontWeight: '700', marginTop: 12, marginBottom: 8 },
  item: { marginBottom: 12 },
  acao: { marginTop: 8 },
  prazo: { marginTop: 4, color: '#666', fontStyle: 'italic' },
  vazio: { alignItems: 'center', gap: 12, marginTop: 32 },
  textoVazio: { color: '#555' },
  erro: { color: '#c00', textAlign: 'center', marginBottom: 8 },
  sucesso: { color: '#0a6b2d', marginBottom: 8 },
});
