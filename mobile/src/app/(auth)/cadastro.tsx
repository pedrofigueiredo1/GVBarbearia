import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { Aviso } from '@/components/Aviso';
import { Botao } from '@/components/Botao';
import { CabecalhoMarca } from '@/components/CabecalhoMarca';
import { CampoTexto } from '@/components/CampoTexto';
import { Tela } from '@/components/Tela';
import { cores } from '@/tema';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';
import { loginCliente } from '@/lib/auth-cliente';
import { cadastrarCliente } from '@/lib/clientes';

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// US Cadastro de Cliente (item 2.37): campos obrigatórios, e-mail único
// (o backend responde 409 se já estiver em uso) e, depois de cadastrar, o
// cliente já entra no app.
export default function CadastroScreen() {
  const { entrar } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  function validar() {
    if (!nome.trim() || !email.trim() || !telefone.trim() || !senha) {
      return 'Preencha todos os campos.';
    }
    if (!EMAIL_VALIDO.test(email.trim())) return 'Informe um e-mail válido.';
    if (senha.length < 6) return 'A senha deve ter pelo menos 6 caracteres.';
    if (senha !== confirmacao) return 'As senhas não conferem.';
    return null;
  }

  async function handleCadastrar() {
    const problema = validar();
    setErro(problema);
    if (problema) return;

    setSalvando(true);
    try {
      await cadastrarCliente({
        nome: nome.trim(),
        email: email.trim(),
        telefone: telefone.trim(),
        senha,
      });
      const resposta = await loginCliente(email.trim(), senha);
      await entrar(resposta.accessToken);
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível cadastrar. Verifique sua conexão com a internet.',
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Tela>
      <CabecalhoMarca titulo="Criar conta" subtitulo="Cadastre-se para agendar seus horários" />

      <CampoTexto rotulo="Nome" value={nome} onChangeText={setNome} maxLength={100} autoComplete="name" />
      <CampoTexto
        rotulo="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <CampoTexto
        rotulo="Telefone"
        value={telefone}
        onChangeText={setTelefone}
        keyboardType="phone-pad"
        maxLength={20}
        autoComplete="tel"
      />
      <CampoTexto
        rotulo="Senha (mínimo 6 caracteres)"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        autoCapitalize="none"
        maxLength={72}
      />
      <CampoTexto
        rotulo="Confirmar senha"
        value={confirmacao}
        onChangeText={setConfirmacao}
        secureTextEntry
        autoCapitalize="none"
        maxLength={72}
      />

      {erro && <Aviso tipo="erro" texto={erro} />}

      <Botao titulo="Cadastrar" onPress={handleCadastrar} carregando={salvando} />

      <Link href="/login" style={styles.link}>
        Já tenho conta. Entrar
      </Link>
    </Tela>
  );
}

const styles = StyleSheet.create({
  link: { textAlign: 'center', color: cores.cobre, fontWeight: '600', paddingVertical: 6 },
});
