import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Aviso } from '@/components/Aviso';
import { Botao } from '@/components/Botao';
import { Calendario } from '@/components/Calendario';
import { Cartao, TextoCartao } from '@/components/Cartao';
import { SeletorHorarios } from '@/components/SeletorHorarios';
import { SeletorOpcoes } from '@/components/SeletorOpcoes';
import { useCarregar } from '@/hooks/useCarregar';
import { ApiError } from '@/lib/api';
import { adicionarAgendamento, consultarHorariosDisponiveis } from '@/lib/agendamentos';
import { formatarDuracao, formatarMoeda } from '@/lib/formatar';
import { listarProfissionais } from '@/lib/profissionais';
import { listarServicos } from '@/lib/servicos';
import { cores } from '@/tema';
import type { HorarioDisponivel } from '@/types/agendamento';

// US Seleção de Serviço, Profissional e Data/Horário (itens 2.46 a 2.48) e
// Cadastro de Agendamento (item 2.49). O serviço é escolhido antes, na aba
// Serviços da Home, e esta tela mostra só ele; aqui o cliente escolhe o
// profissional, o dia no calendário e um dos horários livres. Depois de
// confirmar, o agendamento fica PENDENTE até a barbearia confirmar.
export default function AgendarScreen() {
  // Vindo do "Agendar" de um serviço na Home, o serviço já chega escolhido.
  const { servicoId: servicoParam } = useLocalSearchParams<{ servicoId?: string }>();
  const servicos = useCarregar(listarServicos);
  const profissionais = useCarregar(listarProfissionais);

  const servico = (servicos.dados ?? []).find((s) => s.id === Number(servicoParam));

  const [profissionalId, setProfissionalId] = useState<number | null>(null);
  const [data, setData] = useState<string | null>(null);
  const [horarioEscolhido, setHorarioEscolhido] = useState<string | null>(null);
  const [horarios, setHorarios] = useState<HorarioDisponivel[]>([]);
  const [carregandoHorarios, setCarregandoHorarios] = useState(false);
  const [erroHorarios, setErroHorarios] = useState<string | null>(null);
  // Sobe quando a lista de horários precisa ser buscada de novo (ex.: o
  // horário escolhido foi ocupado por outra pessoa).
  const [versaoHorarios, setVersaoHorarios] = useState(0);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const servicoIdAtual = servico?.id;

  // Os horários livres dependem do serviço (duração), do profissional e do dia.
  useEffect(() => {
    setHorarioEscolhido(null);
    setErroHorarios(null);
    if (servicoIdAtual === undefined || profissionalId === null || data === null) {
      setHorarios([]);
      return;
    }

    let cancelado = false;
    setCarregandoHorarios(true);
    consultarHorariosDisponiveis(servicoIdAtual, profissionalId, data)
      .then((resposta) => {
        if (!cancelado) setHorarios(resposta.horarios);
      })
      .catch((err) => {
        if (cancelado) return;
        setHorarios([]);
        setErroHorarios(
          err instanceof ApiError
            ? err.message
            : 'Não foi possível carregar os horários. Verifique sua conexão com a internet.',
        );
      })
      .finally(() => {
        if (!cancelado) setCarregandoHorarios(false);
      });

    return () => {
      cancelado = true;
    };
  }, [servicoIdAtual, profissionalId, data, versaoHorarios]);

  function recarregar() {
    servicos.recarregar();
    profissionais.recarregar();
  }

  async function handleConfirmar() {
    setErro(null);
    if (!servico || profissionalId === null || !data || !horarioEscolhido) {
      setErro('Escolha o profissional, a data e o horário.');
      return;
    }

    setEnviando(true);
    try {
      const agendamento = await adicionarAgendamento({
        servicoId: servico.id,
        profissionalId,
        dataHora: horarioEscolhido,
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
      // Se alguém ocupou o horário nesse meio tempo, a lista é atualizada.
      if (err instanceof ApiError && err.status === 409) setVersaoHorarios((v) => v + 1);
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
        <ActivityIndicator size="large" color={cores.cobre} />
      </View>
    );
  }

  if (falhaNaCarga) {
    return (
      <View style={styles.centro}>
        <Aviso tipo="erro" texto={falhaNaCarga} />
        <Botao titulo="Tentar novamente" onPress={recarregar} />
      </View>
    );
  }

  // Aberta sem serviço (ou com um serviço que não existe mais): volta para a
  // lista de serviços, onde o agendamento começa.
  if (!servico) {
    return (
      <View style={styles.centro}>
        <Aviso tipo="info" texto="Escolha um serviço na lista para começar o agendamento." />
        <Botao titulo="Ver serviços" onPress={() => router.replace('/')} />
      </View>
    );
  }

  const dicaHorario =
    profissionalId === null
      ? 'Escolha o profissional para ver os horários livres.'
      : data === null
        ? 'Escolha a data para ver os horários livres.'
        : null;

  return (
    <ScrollView contentContainerStyle={styles.conteudo}>
      <View style={styles.grupo}>
        <Text style={styles.rotulo}>Serviço escolhido</Text>
        <Cartao titulo={servico.nome} destaque={formatarMoeda(servico.valor)}>
          <TextoCartao>Duração: {formatarDuracao(servico.duracaoMinutos)}</TextoCartao>
        </Cartao>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Trocar serviço"
          onPress={() => router.back()}
        >
          <Text style={styles.trocar}>Trocar serviço</Text>
        </Pressable>
      </View>

      <SeletorOpcoes
        rotulo="1. Profissional"
        opcoes={(profissionais.dados ?? []).map((profissional) => ({
          id: profissional.id,
          titulo: profissional.nome,
          subtitulo: profissional.especialidade,
        }))}
        selecionadoId={profissionalId}
        onSelecionar={setProfissionalId}
      />

      <View style={styles.grupo}>
        <Text style={styles.rotulo}>2. Data</Text>
        <Calendario selecionada={data} onSelecionar={setData} />
      </View>

      <View style={styles.grupo}>
        <Text style={styles.rotulo}>3. Horário</Text>
        {dicaHorario ? (
          <Text style={styles.dica}>{dicaHorario}</Text>
        ) : (
          <SeletorHorarios
            horarios={horarios}
            selecionado={horarioEscolhido}
            onSelecionar={setHorarioEscolhido}
            carregando={carregandoHorarios}
            erro={erroHorarios}
          />
        )}
      </View>

      {erro && <Aviso tipo="erro" texto={erro} />}

      <Botao titulo="Confirmar agendamento" onPress={handleConfirmar} carregando={enviando} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
    backgroundColor: cores.fundo,
  },
  conteudo: { padding: 16, gap: 20 },
  grupo: { gap: 8 },
  rotulo: { fontSize: 16, fontWeight: '700', color: cores.texto },
  trocar: { color: cores.cobre, fontWeight: '600' },
  dica: { color: cores.textoSecundario, lineHeight: 20 },
});
