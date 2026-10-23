import { Stack } from 'expo-router';
import { cores } from '@/tema';

// Telas da área logada do cliente. A navegação principal (Início, Agendamentos
// e Perfil) fica no grupo (abas), com a barra inferior; as telas abaixo abrem
// por cima dela, com título e botão de voltar.
export default function ClienteLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: cores.fundo },
        headerTintColor: cores.texto,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: cores.fundo },
      }}
    >
      <Stack.Screen name="(abas)" options={{ headerShown: false }} />
      <Stack.Screen name="agendar" options={{ title: 'Agendar horário' }} />
      <Stack.Screen
        name="agendamento-confirmado"
        options={{ title: 'Agendamento realizado', headerBackVisible: false }}
      />
      <Stack.Screen name="avaliar" options={{ title: 'Avaliar atendimento' }} />
    </Stack>
  );
}
