import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Link } from 'expo-router';
import { Botao } from '@/components/Botao';
import { CampoTexto } from '@/components/CampoTexto';
import { Tela } from '@/components/Tela';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';
import { loginCliente } from '@/lib/auth-cliente';

// US Login de Cliente (item 2.38): e-mail e senha; credenciais inválidas
// mostram erro e não liberam acesso (CT02).
export default function LoginScreen() {
  const { entrar } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [entrando, setEntrando] = useState(false);

  async function handleEntrar() {
    setErro(null);
    if (!email.trim() || !senha) {
      setErro('Informe o e-mail e a senha.');
      return;
    }

    setEntrando(true);
    try {
      const resposta = await loginCliente(email.trim(), senha);
      await entrar(resposta.accessToken);
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível entrar. Verifique sua conexão com a internet.',
      );
    } finally {
      setEntrando(false);
    }
  }

  return (
    <Tela>
      <Text style={styles.titulo}>GV Barbearia</Text>
      <Text style={styles.subtitulo}>Entre para agendar seu horário</Text>

      <CampoTexto
        rotulo="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <CampoTexto
        rotulo="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="current-password"
      />

      {erro && <Text style={styles.erro}>{erro}</Text>}

      <Botao titulo="Entrar" onPress={handleEntrar} carregando={entrando} />

      <Link href="/esqueci-senha" style={styles.link}>
        Esqueci minha senha
      </Link>
      <Link href="/cadastro" style={styles.link}>
        Ainda não tenho conta. Cadastrar
      </Link>
    </Tela>
  );
}

const styles = StyleSheet.create({
  titulo: { fontSize: 26, fontWeight: '700', textAlign: 'center' },
  subtitulo: { textAlign: 'center', color: '#555', marginBottom: 8 },
  erro: { color: '#c00' },
  link: { textAlign: 'center', textDecorationLine: 'underline', paddingVertical: 4 },
});
