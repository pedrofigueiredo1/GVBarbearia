import { useEffect, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { cores } from '@/tema';

// ===== ROTAS PROTEGIDAS =====
// Ctrl+F "ROTAS PROTEGIDAS" para achar este bloco.
// Mesma ideia do (painel) + AuthGate do painel admin: sem token, só o grupo
// (auth) (login/cadastro) existe; com token, só o grupo (cliente). Quando o
// token muda (login, logout, sessão expirada), as rotas do outro grupo passam a valer.
// Ao ENTRAR, o Expo Router já cai na tela inicial; ao SAIR ele não escolhe uma tela
// nova sozinho (a rota atual some e aparece "Unmatched Route"), por isso o app é
// levado ao login explicitamente.
function Rotas() {
  const { token, carregando } = useAuth();
  const router = useRouter();
  const estavaLogado = useRef(false);
  const logado = token !== null;

  useEffect(() => {
    if (carregando) return;
    if (estavaLogado.current && !logado) router.replace('/login');
    estavaLogado.current = logado;
  }, [logado, carregando, router]);

  if (carregando) {
    return (
      <View
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: cores.fundo }}
      >
        <ActivityIndicator size="large" color={cores.cobre} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cores.fundo } }}>
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
