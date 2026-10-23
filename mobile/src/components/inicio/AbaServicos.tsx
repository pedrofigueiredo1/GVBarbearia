import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Avatar } from '@/components/Avatar';
import { Botao } from '@/components/Botao';
import { formatarDuracao, formatarMoeda } from '@/lib/formatar';
import { cores, raio } from '@/tema';
import type { Servico } from '@/types/servico';
import { Carrossel } from './Carrossel';
import { EstadoConsulta, type Consulta } from './EstadoConsulta';

const FOTOS = [require('../../../assets/images/ambiente-1.jpg')];

// US Consulta de Serviços (item 2.42): nome, descrição, valor e duração. Cada
// serviço tem um "Agendar" que já abre o agendamento com ele escolhido.
export function AbaServicos({ consulta }: { consulta: Consulta<Servico[]> }) {
  const [busca, setBusca] = useState('');
  const termo = busca.trim().toLowerCase();

  return (
    <View style={styles.aba}>
      <Carrossel fotos={FOTOS} rotulo="Foto da placa da barbearia" />
      <EstadoConsulta consulta={consulta} mensagemVazia="Nenhum serviço disponível no momento.">
        {(servicos) => {
          const filtrados = servicos.filter((servico) =>
            servico.nome.toLowerCase().includes(termo),
          );
          return (
            <View style={styles.bloco}>
              <View style={styles.busca}>
                <Ionicons name="search" size={20} color={cores.textoSecundario} />
                <TextInput
                  accessibilityLabel="Pesquisar serviço"
                  placeholder="Pesquisar serviço"
                  placeholderTextColor={cores.textoSecundario}
                  selectionColor={cores.cobre}
                  value={busca}
                  onChangeText={setBusca}
                  style={styles.campoBusca}
                />
              </View>

              {filtrados.length === 0 ? (
                <Text style={styles.vazio}>Nenhum serviço encontrado.</Text>
              ) : (
                filtrados.map((servico) => (
                  <View key={servico.id} style={styles.linha}>
                    <Avatar />
                    <View style={styles.dados}>
                      <Text style={styles.nome}>{servico.nome}</Text>
                      {servico.descricao ? (
                        <Text style={styles.descricao} numberOfLines={2}>
                          {servico.descricao}
                        </Text>
                      ) : null}
                      <View style={styles.detalhes}>
                        <Text style={styles.valor}>{formatarMoeda(servico.valor)}</Text>
                        <Ionicons name="time-outline" size={15} color={cores.textoSecundario} />
                        <Text style={styles.duracao}>
                          {formatarDuracao(servico.duracaoMinutos)}
                        </Text>
                      </View>
                    </View>
                    <Botao
                      titulo="Agendar"
                      compacto
                      onPress={() =>
                        router.push({
                          pathname: '/agendar',
                          params: { servicoId: String(servico.id) },
                        })
                      }
                    />
                  </View>
                ))
              )}
            </View>
          );
        }}
      </EstadoConsulta>
    </View>
  );
}

const styles = StyleSheet.create({
  aba: { gap: 16 },
  bloco: { gap: 4 },
  busca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio.medio,
    backgroundColor: cores.superficie,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  campoBusca: { flex: 1, color: cores.texto, fontSize: 16, paddingVertical: 12 },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },
  dados: { flex: 1, gap: 3 },
  nome: { fontSize: 16, fontWeight: '700', color: cores.texto },
  descricao: { color: cores.textoSecundario, fontSize: 13, lineHeight: 18 },
  detalhes: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  valor: { color: cores.cobre, fontWeight: '700', marginRight: 6 },
  duracao: { color: cores.textoSecundario, fontSize: 14 },
  vazio: { textAlign: 'center', color: cores.textoSecundario, paddingVertical: 24 },
});
