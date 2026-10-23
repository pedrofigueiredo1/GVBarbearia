import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores, raio } from '@/tema';
import type { Barbearia } from '@/types/barbearia';
import { Carrossel } from './Carrossel';
import { EstadoConsulta, type Consulta } from './EstadoConsulta';

// Fachada, cadeiras, leão e poltronas.
const FOTOS_ESPACO = [
  require('../../../assets/images/ambiente-2.jpg'),
  require('../../../assets/images/ambiente-3.jpg'),
  require('../../../assets/images/ambiente-4.jpg'),
  require('../../../assets/images/ambiente-5.jpg'),
];

function abrir(url: string) {
  Linking.openURL(url).catch(() => undefined);
}

// US Consulta de Informações da Barbearia (item 2.41): endereço, telefone e
// horário de funcionamento, sempre os dados mais atuais cadastrados pelo
// administrador. Sem cadastro, informa que não há informações (CT02).
export function AbaSobre({ consulta }: { consulta: Consulta<Barbearia | null> }) {
  return (
    <View style={styles.aba}>
      <Carrossel fotos={FOTOS_ESPACO} rotulo="Foto do espaço" />
      <EstadoConsulta
        consulta={consulta}
        mensagemVazia="Não há informações da barbearia disponíveis no momento."
      >
        {(barbearia) => {
          const digitos = barbearia.telefone.replace(/\D/g, '');
          return (
            <View style={styles.bloco}>
              <View style={styles.cartao}>
                <Text style={styles.titulo}>Localização</Text>
                <Text style={styles.texto}>{barbearia.endereco}</Text>
                <Acao
                  icone="navigate-outline"
                  rotulo="Abrir no mapa"
                  onPress={() =>
                    abrir(
                      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(barbearia.endereco)}`,
                    )
                  }
                />
              </View>

              <View style={styles.cartao}>
                <Text style={styles.titulo}>Horário de atendimento</Text>
                <Text style={styles.texto}>{barbearia.horarioFuncionamento}</Text>
              </View>

              <View style={styles.cartao}>
                <Text style={styles.titulo}>Contato</Text>
                <Text style={styles.texto}>{barbearia.telefone}</Text>
                <View style={styles.acoes}>
                  <Acao
                    icone="call-outline"
                    rotulo="Ligar"
                    onPress={() => abrir(`tel:${digitos}`)}
                  />
                  <Acao
                    icone="logo-whatsapp"
                    rotulo="WhatsApp"
                    onPress={() => abrir(`https://wa.me/55${digitos}`)}
                  />
                </View>
              </View>
            </View>
          );
        }}
      </EstadoConsulta>
    </View>
  );
}

function Acao({
  icone,
  rotulo,
  onPress,
}: {
  icone: keyof typeof Ionicons.glyphMap;
  rotulo: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      onPress={onPress}
      style={styles.acao}
    >
      <Ionicons name={icone} size={18} color={cores.cobre} />
      <Text style={styles.acaoTexto}>{rotulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  aba: { gap: 16 },
  bloco: { gap: 12 },
  cartao: {
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio.grande,
    padding: 16,
    gap: 8,
  },
  titulo: { fontSize: 16, fontWeight: '700', color: cores.texto },
  texto: { color: cores.textoSecundario, lineHeight: 22 },
  acoes: { flexDirection: 'row', gap: 10 },
  acao: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio.pilula,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  acaoTexto: { color: cores.cobre, fontWeight: '600' },
});
