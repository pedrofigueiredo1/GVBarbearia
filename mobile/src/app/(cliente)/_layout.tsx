import { Stack } from 'expo-router';

// Telas da área logada do cliente (home, serviços, agendamentos, perfil...).
export default function ClienteLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
