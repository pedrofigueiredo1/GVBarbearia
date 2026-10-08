import { ActivityIndicator, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '@/context/AuthContext';

// ===== ROTAS PROTEGIDAS =====
// Ctrl+F "ROTAS PROTEGIDAS" para achar este bloco.
// Mesma ideia do (painel) + AuthGate do painel admin: sem token, só o grupo
// (auth) (login/cadastro) existe; com token, só o grupo (cliente). Quando o
// token muda (login, logout, sessão expirada), o Expo Router redireciona sozinho.
function Rotas() {
  const { token, carregando } = useAuth();

  if (carregando) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const logado = token !== null;

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!logado}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
        <Stack.Protected guard={logado}>
          <Stack.Screen name="(cliente)" />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <Rotas />
    </AuthProvider>
  );
}
