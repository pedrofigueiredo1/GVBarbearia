import { Stack } from 'expo-router';

// Telas da área logada do cliente. A Home não tem cabeçalho; as demais têm
// título e botão de voltar.
export default function ClienteLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="agendar" options={{ title: 'Agendar horário' }} />
      <Stack.Screen
        name="agendamento-confirmado"
        options={{ title: 'Agendamento realizado', headerBackVisible: false }}
      />
      <Stack.Screen name="meus-agendamentos" options={{ title: 'Meus agendamentos' }} />
      <Stack.Screen name="avaliar" options={{ title: 'Avaliar atendimento' }} />
      <Stack.Screen name="perfil" options={{ title: 'Meu perfil' }} />
      <Stack.Screen name="barbearia" options={{ title: 'Informações da barbearia' }} />
      <Stack.Screen name="servicos" options={{ title: 'Serviços' }} />
      <Stack.Screen name="profissionais" options={{ title: 'Profissionais' }} />
      <Stack.Screen name="produtos" options={{ title: 'Produtos' }} />
      <Stack.Screen name="avaliacoes" options={{ title: 'Avaliações' }} />
    </Stack>
  );
}
