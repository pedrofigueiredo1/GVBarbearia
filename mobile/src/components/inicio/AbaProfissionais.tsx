import { Image, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '@/components/Avatar';
import { fotoDoProfissional } from '@/lib/fotos-profissionais';
import { cores, raio } from '@/tema';
import type { Profissional } from '@/types/profissional';
import { Carrossel } from './Carrossel';
import { EstadoConsulta, type Consulta } from './EstadoConsulta';

const FOTOS_EQUIPE = [require('../../../assets/images/equipe.jpg')];

// US Consulta de Profissionais (item 2.43): nome, especialidade e descrição,
// com a foto da equipe no topo e a foto de cada barbeiro.
export function AbaProfissionais({ consulta }: { consulta: Consulta<Profissional[]> }) {
  return (
    <View style={styles.aba}>
      <Carrossel fotos={FOTOS_EQUIPE} rotulo="Foto da equipe" />
      <EstadoConsulta
        consulta={consulta}
        mensagemVazia="Nenhum profissional disponível no momento."
      >
        {(profissionais) => (
          <View>
            {profissionais.map((profissional) => {
              const foto = fotoDoProfissional(profissional.nome);
              return (
                <View key={profissional.id} style={styles.linha}>
                  {foto ? (
                    <Image
                      source={foto}
                      style={styles.foto}
                      resizeMode="cover"
                      accessibilityLabel={`Foto de ${profissional.nome}`}
                    />
                  ) : (
                    <Avatar nome={profissional.nome} tamanho={84} />
                  )}
                  <View style={styles.dados}>
                    <Text style={styles.nome}>{profissional.nome}</Text>
                    <Text style={styles.especialidade}>{profissional.especialidade}</Text>
                    {profissional.descricao ? (
                      <Text style={styles.descricao}>{profissional.descricao}</Text>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </EstadoConsulta>
    </View>
  );
}

const styles = StyleSheet.create({
  aba: { gap: 16 },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },
  foto: { width: 84, height: 112, borderRadius: raio.medio, backgroundColor: cores.superficie },
  dados: { flex: 1, gap: 2 },
  nome: { fontSize: 17, fontWeight: '700', color: cores.texto },
  especialidade: { color: cores.cobre, fontWeight: '600' },
  descricao: { color: cores.textoSecundario, fontSize: 13, lineHeight: 18 },
});
