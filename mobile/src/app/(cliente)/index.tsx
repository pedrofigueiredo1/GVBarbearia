import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';

// Placeholder do Dia B0: a Home de verdade (US 2.40) vem no Dia B3. O botão
// Sair já usa o logout real, que fecha a sessão e volta para o login.
export default function HomeScreen() {
  const { sair } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Home do cliente</Text>
      <Text>Área logada (tela em construção)</Text>
      <Pressable onPress={sair} style={styles.botao}>
        <Text style={styles.textoBotao}>Sair</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24 },
  titulo: { fontSize: 22, fontWeight: '600' },
  botao: { marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#222', borderRadius: 6 },
  textoBotao: { color: '#fff', fontWeight: '600' },
});
