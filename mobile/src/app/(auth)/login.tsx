import { StyleSheet, Text, View } from 'react-native';

// Placeholder do Dia B0: a tela de login de verdade (US 2.38) vem no Dia B2.
export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>GV Barbearia</Text>
      <Text>Login do cliente (tela em construção)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24 },
  titulo: { fontSize: 22, fontWeight: '600' },
});
