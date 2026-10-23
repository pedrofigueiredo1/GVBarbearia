import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores, raio } from '@/tema';

interface Props {
  // Dia escolhido, no formato AAAA-MM-DD (o mesmo que a API usa).
  selecionada: string | null;
  onSelecionar: (data: string) => void;
  // Até quantos dias à frente dá para agendar.
  diasAdiante?: number;
}

const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];
const DIAS_DA_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

// A barbearia fecha aos domingos (0). Os horários de cada dia vêm da API; aqui
// só evitamos oferecer um dia em que nunca há atendimento.
const DIAS_FECHADOS = [0];

const dois = (n: number) => String(n).padStart(2, '0');
const chave = (ano: number, mes: number, dia: number) => `${ano}-${dois(mes + 1)}-${dois(dia)}`;

// Calendário mensal no visual do app: toque num dia para escolher; dias que já
// passaram, os depois do limite e os de folga ficam apagados.
export function Calendario({ selecionada, onSelecionar, diasAdiante = 60 }: Props) {
  const agora = new Date();
  const hoje = chave(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const limiteData = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + diasAdiante);
  const limite = chave(limiteData.getFullYear(), limiteData.getMonth(), limiteData.getDate());

  const [visivel, setVisivel] = useState({ ano: agora.getFullYear(), mes: agora.getMonth() });

  const primeiroDiaDaSemana = new Date(visivel.ano, visivel.mes, 1).getDay();
  const diasNoMes = new Date(visivel.ano, visivel.mes + 1, 0).getDate();
  const celulas: (number | null)[] = [
    ...Array<null>(primeiroDiaDaSemana).fill(null),
    ...Array.from({ length: diasNoMes }, (_, i) => i + 1),
  ];
  // Completa a última semana e separa em linhas de 7 dias (domingo a sábado).
  while (celulas.length % 7 !== 0) celulas.push(null);
  const semanas = Array.from({ length: celulas.length / 7 }, (_, i) =>
    celulas.slice(i * 7, i * 7 + 7),
  );

  const podeVoltar = visivel.ano * 12 + visivel.mes > agora.getFullYear() * 12 + agora.getMonth();
  const podeAvancar =
    visivel.ano * 12 + visivel.mes < limiteData.getFullYear() * 12 + limiteData.getMonth();

  function mudarMes(delta: number) {
    const novo = new Date(visivel.ano, visivel.mes + delta, 1);
    setVisivel({ ano: novo.getFullYear(), mes: novo.getMonth() });
  }

  return (
    <View style={styles.caixa}>
      <View style={styles.cabecalho}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Mês anterior"
          onPress={() => mudarMes(-1)}
          disabled={!podeVoltar}
          hitSlop={8}
          style={[styles.seta, !podeVoltar && styles.setaDesabilitada]}
        >
          <Ionicons name="chevron-back" size={22} color={cores.texto} />
        </Pressable>
        <Text style={styles.mes}>
          {MESES[visivel.mes]} de {visivel.ano}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Próximo mês"
          onPress={() => mudarMes(1)}
          disabled={!podeAvancar}
          hitSlop={8}
          style={[styles.seta, !podeAvancar && styles.setaDesabilitada]}
        >
          <Ionicons name="chevron-forward" size={22} color={cores.texto} />
        </Pressable>
      </View>

      <View style={styles.semana}>
        {DIAS_DA_SEMANA.map((letra, indice) => (
          <Text key={indice} style={styles.diaDaSemana}>
            {letra}
          </Text>
        ))}
      </View>

      <View>
        {semanas.map((semana, indiceSemana) => (
          <View key={indiceSemana} style={styles.semana}>
            {semana.map((dia, diaDaSemana) => {
              if (dia === null) return <View key={`vazio-${diaDaSemana}`} style={styles.celula} />;

              const data = chave(visivel.ano, visivel.mes, dia);
              const desabilitado =
                data < hoje || data > limite || DIAS_FECHADOS.includes(diaDaSemana);
              const escolhido = data === selecionada;

              return (
                <View key={data} style={styles.celula}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${dia} de ${MESES[visivel.mes]}`}
                    accessibilityState={{ selected: escolhido, disabled: desabilitado }}
                    disabled={desabilitado}
                    onPress={() => onSelecionar(data)}
                    style={[
                      styles.dia,
                      data === hoje && styles.diaDeHoje,
                      escolhido && styles.diaEscolhido,
                    ]}
                  >
                    <Text
                      style={[
                        styles.numero,
                        desabilitado && styles.numeroDesabilitado,
                        escolhido && styles.numeroEscolhido,
                      ]}
                    >
                      {dia}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  caixa: {
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio.grande,
    padding: 12,
    gap: 8,
  },
  cabecalho: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mes: { color: cores.texto, fontSize: 17, fontWeight: '700' },
  seta: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.superficieAlta,
  },
  setaDesabilitada: { opacity: 0.3 },
  semana: { flexDirection: 'row' },
  diaDaSemana: {
    flex: 1,
    textAlign: 'center',
    color: cores.textoSecundario,
    fontSize: 13,
    fontWeight: '600',
    paddingVertical: 4,
  },
  celula: { flex: 1, aspectRatio: 1, padding: 2 },
  dia: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: raio.pilula,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  diaDeHoje: { borderColor: cores.cobre },
  diaEscolhido: { backgroundColor: cores.cobre, borderColor: cores.cobre },
  numero: { color: cores.texto, fontSize: 16, fontWeight: '600' },
  numeroDesabilitado: { color: cores.borda, fontWeight: '400' },
  numeroEscolhido: { color: cores.sobreCobre, fontWeight: '800' },
});
