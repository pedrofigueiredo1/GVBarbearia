import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { Botao } from '@/components/Botao';
import { CampoTexto } from '@/components/CampoTexto';
import { Tela } from '@/components/Tela';
import { ApiError } from '@/lib/api';
import { redefinirSenha } from '@/lib/auth-cliente';

// US Recuperação de Senha de Cliente (item 2.39): só conclui com o código de
// 6 dígitos recebido por e-mail, dentro de 15 minutos e de até 5 tentativas.
export default function RedefinirSenhaScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email ?? '');
  const [codigo, setCodigo] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  function validar() {
    if (!email.trim() || !codigo || !novaSenha) return 'Preencha todos os campos.';
    if (!/^\d{6}$/.test(codigo)) return 'O código deve ter 6 dígitos.';
    if (novaSenha.length < 6) return 'A senha deve ter pelo menos 6 caracteres.';
    if (novaSenha !== confirmacao) return 'As senhas não conferem.';
    return null;
  }

  async function handleRedefinir() {
    const problema = validar();
    setErro(problema);
    if (problema) return;

    setSalvando(true);
    try {
      const resposta = await redefinirSenha(email.trim(), codigo, novaSenha);
      setMensagem(resposta.mensagem);
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível redefinir. Verifique sua conexão com a internet.',
      );
    } finally {
      setSalvando(false);
    }
  }

  if (mensagem) {
    return (
      <Tela>
        <Text style={styles.titulo}>Senha redefinida</Text>
        <Text style={styles.sucesso}>{mensagem}</Text>
        <Botao titulo="Ir para o login" onPress={() => router.replace('/login')} />
      </Tela>
    );
  }

  return (
    <Tela>
      <Text style={styles.titulo}>Criar nova senha</Text>

      <CampoTexto
        rotulo="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <CampoTexto
        rotulo="Código de 6 dígitos"
        value={codigo}
        onChangeText={(texto) => setCodigo(texto.replace(/\D/g, ''))}
        keyboardType="number-pad"
        maxLength={6}
      />
      <CampoTexto
        rotulo="Nova senha (mínimo 6 caracteres)"
        value={novaSenha}
        onChangeText={setNovaSenha}
        secureTextEntry
        autoCapitalize="none"
        maxLength={72}
      />
      <CampoTexto
        rotulo="Confirmar nova senha"
        value={confirmacao}
        onChangeText={setConfirmacao}
        secureTextEntry
        autoCapitalize="none"
        maxLength={72}
      />

      {erro && <Text style={styles.erro}>{erro}</Text>}

      <Botao titulo="Redefinir senha" onPress={handleRedefinir} carregando={salvando} />

      <Link href="/esqueci-senha" style={styles.link}>
        Pedir um novo código
      </Link>
    </Tela>
  );
}

const styles = StyleSheet.create({
  titulo: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  erro: { color: '#c00' },
  sucesso: { color: '#0a6b2d', textAlign: 'center' },
  link: { textAlign: 'center', textDecorationLine: 'underline', paddingVertical: 4 },
});
