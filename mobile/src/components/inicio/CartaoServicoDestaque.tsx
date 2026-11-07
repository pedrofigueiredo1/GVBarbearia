import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Botao } from '@/components/Botao';
import { formatarDuracao, formatarMoeda } from '@/lib/formatar';
import { cores, raio } from '@/tema';
import type { Servico } from '@/types/servico';

const FOGO = '#FF6A1A';
const FOGO_CLARO = '#FFB347';
const FOGO_ESCURO = '#B3260E';

// Card do serviço mais agendado: fica separado da lista, com a borda laranja
// pulsando e um brilho atrás, para o cliente ver de cara o que mais sai na
// barbearia. O destaque vem do backend (ranking automático), o app só desenha.
export function CartaoServicoDestaque({ servico }: { servico: Servico }) {
  const brilho = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animacao = Animated.loop(
      Animated.sequence([
        Animated.timing(brilho, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(brilho, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ]),
    );
    animacao.start();
    return () => animacao.stop();
  }, [brilho]);

  const total = servico.totalAgendamentos ?? 0;
  const dias = servico.janelaDoRankingDias ?? 7;

  return (
    <View style={styles.externo} accessibilityLabel={`Serviço mais agendado: ${servico.nome}`}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.halo,
          { opacity: brilho.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.9] }) },
        ]}
      />

      <Animated.View
        style={[
          styles.cartao,
          { borderColor: brilho.interpolate({ inputRange: [0, 1], outputRange: [FOGO_ESCURO, FOGO_CLARO] }) },
        ]}
      >
        <View style={styles.selo}>
          <Ionicons name="flame" size={14} color="#fff" />
          <Text style={styles.textoSelo}>MAIS AGENDADO</Text>
        </View>

        <Text style={styles.nome}>{servico.nome}</Text>
        {servico.descricao ? (
          <Text style={styles.descricao} numberOfLines={2}>
            {servico.descricao}
          </Text>
        ) : null}

        <View style={styles.detalhes}>
          <Text style={styles.valor}>{formatarMoeda(servico.valor)}</Text>
          <Ionicons name="time-outline" size={15} color={cores.textoSecundario} />
          <Text style={styles.duracao}>{formatarDuracao(servico.duracaoMinutos)}</Text>
        </View>

        <Text style={styles.ranking}>
          {total === 1 ? '1 agendamento' : `${total} agendamentos`} nos últimos {dias} dias
        </Text>

        <Botao
          titulo="Agendar"
          onPress={() =>
            router.push({ pathname: '/agendar', params: { servicoId: String(servico.id) } })
          }
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  externo: { marginTop: 8, marginBottom: 12 },
  // Brilho laranja atrás do card, pulsando devagar.
  halo: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: raio.grande + 6,
    backgroundColor: FOGO_ESCURO,
  },
  cartao: {
    gap: 8,
    padding: 16,
    borderRadius: raio.grande,
    borderWidth: 2,
    borderColor: FOGO,
    backgroundColor: '#1C0F0A',
  },
  selo: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: raio.pilula,
    backgroundColor: FOGO,
  },
  textoSelo: { color: '#fff', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  nome: { fontSize: 20, fontWeight: '800', color: cores.texto },
  descricao: { color: cores.textoSecundario, fontSize: 14, lineHeight: 20 },
  detalhes: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  valor: { color: FOGO_CLARO, fontWeight: '800', fontSize: 16, marginRight: 6 },
  duracao: { color: cores.textoSecundario, fontSize: 14 },
  ranking: { color: FOGO_CLARO, fontSize: 13, fontWeight: '600', marginBottom: 4 },
});
