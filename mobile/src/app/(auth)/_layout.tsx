import { Stack } from 'expo-router';

// Telas para quem ainda não está logado. O login é a tela inicial do grupo;
// sem isso o Expo Router abriria a primeira em ordem alfabética (cadastro).
export const unstable_settings = { anchor: 'login' };

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
