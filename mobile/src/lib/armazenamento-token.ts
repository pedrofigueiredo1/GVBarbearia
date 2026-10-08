// ===== ARMAZENAMENTO DO TOKEN =====
// Ctrl+F "ARMAZENAMENTO DO TOKEN" para achar este bloco.
// No celular o token fica no SecureStore (cofre criptografado do sistema).
// O SecureStore não existe no navegador, então na versão web (usada só para
// testar o app no computador) o token vai para o localStorage.
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const CHAVE = 'gvbarbearia.token';

export async function lerToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return typeof localStorage === 'undefined' ? null : localStorage.getItem(CHAVE);
  }
  return SecureStore.getItemAsync(CHAVE);
}

export async function salvarToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(CHAVE, token);
    return;
  }
  await SecureStore.setItemAsync(CHAVE, token);
}

export async function apagarToken(): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(CHAVE);
    return;
  }
  await SecureStore.deleteItemAsync(CHAVE);
}
