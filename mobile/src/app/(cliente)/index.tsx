import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Botao } from '@/components/Botao';
import { useAuth } from '@/context/AuthContext';

const OPCOES = [
  { titulo: 'Informações da barbearia', descricao: 'Endereço, telefone e horário de funcionamento', rota: '/barbearia' },
  { titulo: 'Serviços', descricao: 'Veja o que oferecemos, valores e duração', rota: '/servicos' },
  { titulo: 'Profissionais', descricao: 'Conheça quem atende na barbearia', rota: '/profissionais' },
  { titulo: 'Produtos', descricao: 'Produtos disponíveis na barbearia', rota: '/produtos' },
  { titulo: 'Avaliações', descricao: 'O que os clientes estão dizendo', rota: '/avaliacoes' },
] as const;

// US Visualização da Home (item 2.40): tela inicial do cliente logado, com
// acesso às consultas. Agendar, "Meus agendamentos" e Perfil entram nos
// próximos dias.
export default function HomeScreen() {
  const { cliente, sair } = useAuth();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.conteudo}>
        <Text style={styles.titulo}>Olá{cliente ? `, ${cliente.nome}` : ''}!</Text>
        <Text style={styles.subtitulo}>O que você quer ver hoje?</Text>

        <View style={styles.opcoes}>
          {OPCOES.map((opcao) => (
            <Pressable
              key={opcao.rota}
              accessibilityRole="button"
              accessibilityLabel={opcao.titulo}
              onPress={() => router.push(opcao.rota)}
              style={styles.opcao}
            >
              <Text style={styles.opcaoTitulo}>{opcao.titulo}</Text>
              <Text style={styles.opcaoDescricao}>{opcao.descricao}</Text>
            </Pressable>
          ))}
        </View>

        <Botao titulo="Sair" secundario onPress={sair} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  conteudo: { padding: 20, gap: 12 },
  titulo: { fontSize: 24, fontWeight: '700' },
  subtitulo: { color: '#555', marginBottom: 4 },
  opcoes: { gap: 10, marginVertical: 8 },
  opcao: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 14, gap: 2 },
  opcaoTitulo: { fontSize: 17, fontWeight: '600' },
  opcaoDescricao: { color: '#555' },
});
