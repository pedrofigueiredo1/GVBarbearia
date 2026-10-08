import { Stack } from 'expo-router';

// Telas para quem ainda não está logado: login, cadastro e recuperação de senha.
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
