import { useState } from 'react';
import { Image, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AbaAvaliacoes } from '@/components/inicio/AbaAvaliacoes';
import { AbaProdutos } from '@/components/inicio/AbaProdutos';
import { AbaProfissionais } from '@/components/inicio/AbaProfissionais';
import { AbaServicos } from '@/components/inicio/AbaServicos';
import { AbaSobre } from '@/components/inicio/AbaSobre';
import { Abas } from '@/components/inicio/Abas';
import { useAuth } from '@/context/AuthContext';
import { useCarregar } from '@/hooks/useCarregar';
import { listarAvaliacoes } from '@/lib/avaliacoes';
import { consultarBarbearia } from '@/lib/barbearia';
import { listarProdutos } from '@/lib/produtos';
import { listarProfissionais } from '@/lib/profissionais';
import { listarServicos } from '@/lib/servicos';
import { cores, raio } from '@/tema';

const ABAS = ['Serviços', 'Profissionais', 'Produtos', 'Avaliações', 'Sobre'] as const;
type Aba = (typeof ABAS)[number];

// US Visualização da Home (item 2.40): tela inicial do cliente logado. Reúne
// as consultas ao catálogo da barbearia (serviços, profissionais, produtos,
// avaliações e informações) em abas e leva ao agendamento. Meus agendamentos e
// Perfil ficam na barra inferior.
export default function InicioScreen() {
  const { cliente } = useAuth();
  const servicos = useCarregar(listarServicos);
  const profissionais = useCarregar(listarProfissionais);
  const produtos = useCarregar(listarProdutos);
  const avaliacoes = useCarregar(listarAvaliacoes);
  const barbearia = useCarregar(consultarBarbearia);
  const [aba, setAba] = useState<Aba>('Serviços');

  const consultas = [servicos, profissionais, produtos, avaliacoes, barbearia];
  const atualizando = consultas.some((consulta) => consulta.carregando && consulta.dados !== null);

  function recarregarTudo() {
    consultas.forEach((consulta) => consulta.recarregar());
  }

  const lista = avaliacoes.dados ?? [];
  const media =
    lista.length > 0 ? lista.reduce((soma, a) => soma + a.nota, 0) / lista.length : null;
  const primeiroNome = cliente?.nome.split(' ')[0];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.conteudo}
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={recarregarTudo}
            tintColor={cores.cobre}
            colors={[cores.cobre]}
            progressBackgroundColor={cores.superficieAlta}
          />
        }
      >
        <View style={styles.cabecalho}>
          <Image
            source={require('../../../../assets/images/logo.png')}
            style={styles.logo}
            accessibilityLabel="GV Barbearia"
          />
          <View style={styles.titulos}>
            {primeiroNome ? <Text style={styles.saudacao}>Olá, {primeiroNome}!</Text> : null}
            <Text style={styles.nome}>GV BARBEARIA</Text>
            <Text style={styles.cidade}>Umuarama/PR</Text>
          </View>
          <View style={styles.nota}>
            <Ionicons name="star" size={14} color={cores.cobre} />
            <Text style={styles.notaTexto}>
              {media === null ? 'Novo' : media.toFixed(1).replace('.', ',')}
            </Text>
          </View>
        </View>

        <View style={styles.abas}>
          <Abas abas={ABAS} ativa={aba} onSelecionar={setAba} />
        </View>

        <View style={styles.aba}>
          {aba === 'Serviços' && <AbaServicos consulta={servicos} />}
          {aba === 'Profissionais' && <AbaProfissionais consulta={profissionais} />}
          {aba === 'Produtos' && <AbaProdutos consulta={produtos} />}
          {aba === 'Avaliações' && <AbaAvaliacoes consulta={avaliacoes} />}
          {aba === 'Sobre' && <AbaSobre consulta={barbearia} />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { paddingTop: 8, paddingBottom: 24, gap: 16 },
  cabecalho: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16 },
  logo: { width: 64, height: 64 },
  titulos: { flex: 1 },
  saudacao: { color: cores.textoSecundario, fontSize: 13 },
  nome: { color: cores.texto, fontSize: 20, fontWeight: '800', letterSpacing: 0.5 },
  cidade: { color: cores.textoSecundario, fontSize: 13 },
  nota: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: cores.superficieAlta,
    borderRadius: raio.pilula,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  notaTexto: { color: cores.texto, fontWeight: '700' },
  abas: { marginTop: 4 },
  aba: { paddingHorizontal: 16 },
});
