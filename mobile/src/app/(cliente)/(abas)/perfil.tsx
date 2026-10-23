import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Aviso } from '@/components/Aviso';
import { Avatar } from '@/components/Avatar';
import { Botao } from '@/components/Botao';
import { CampoTexto } from '@/components/CampoTexto';
import { Tela } from '@/components/Tela';
import { useAuth } from '@/context/AuthContext';
import { useCarregar } from '@/hooks/useCarregar';
import { ApiError } from '@/lib/api';
import { consultarPerfil, editarPerfil } from '@/lib/clientes';
import { cores } from '@/tema';
import type { EditarPerfilInput, Perfil } from '@/types/cliente';

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// US Visualização e Edição de Perfil do Cliente (item 2.55): nome, e-mail,
// telefone e senha. Trocar o e-mail ou a senha exige a senha atual, e e-mail
// já usado por outro cliente é recusado pelo backend.
export default function PerfilScreen() {
  const { dados, carregando, erro, recarregar } = useCarregar(consultarPerfil);

  if (carregando && dados === null) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={cores.cobre} />
      </View>
    );
  }

  if (erro || dados === null) {
    return (
      <View style={styles.centro}>
        <Text style={styles.erro}>{erro ?? 'Não foi possível carregar o perfil.'}</Text>
        <Botao titulo="Tentar novamente" onPress={recarregar} />
      </View>
    );
  }

  return <FormularioPerfil perfilInicial={dados} />;
}

function FormularioPerfil({ perfilInicial }: { perfilInicial: Perfil }) {
  const { atualizarCliente, sair } = useAuth();
  const [salvo, setSalvo] = useState(perfilInicial);
  const [nome, setNome] = useState(perfilInicial.nome);
  const [email, setEmail] = useState(perfilInicial.email);
  const [telefone, setTelefone] = useState(perfilInicial.telefone);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  function montarAlteracoes(): { corpo: EditarPerfilInput; problema: string | null } {
    const corpo: EditarPerfilInput = {};
    if (nome.trim() !== salvo.nome) corpo.nome = nome.trim();
    if (telefone.trim() !== salvo.telefone) corpo.telefone = telefone.trim();
    if (email.trim() !== salvo.email) corpo.email = email.trim();
    if (novaSenha) corpo.novaSenha = novaSenha;

    if (!nome.trim() || !telefone.trim() || !email.trim()) {
      return { corpo, problema: 'Nome, e-mail e telefone não podem ficar vazios.' };
    }
    if (!EMAIL_VALIDO.test(email.trim())) return { corpo, problema: 'Informe um e-mail válido.' };
    if (novaSenha && novaSenha.length < 6) {
      return { corpo, problema: 'A nova senha deve ter pelo menos 6 caracteres.' };
    }
    if (novaSenha !== confirmacao) return { corpo, problema: 'As senhas não conferem.' };
    if ((corpo.email || corpo.novaSenha) && !senhaAtual) {
      return { corpo, problema: 'Informe a senha atual para alterar o e-mail ou a senha.' };
    }
    if (corpo.email || corpo.novaSenha) corpo.senhaAtual = senhaAtual;
    return { corpo, problema: null };
  }

  async function handleSalvar() {
    setMensagem(null);
    const { corpo, problema } = montarAlteracoes();
    setErro(problema);
    if (problema) return;
    if (Object.keys(corpo).length === 0) {
      setMensagem('Nenhuma alteração para salvar.');
      return;
    }

    setSalvando(true);
    try {
      const atualizado = await editarPerfil(corpo);
      setSalvo(atualizado);
      setNome(atualizado.nome);
      setEmail(atualizado.email);
      setTelefone(atualizado.telefone);
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmacao('');
      atualizarCliente({ id: atualizado.id, nome: atualizado.nome, email: atualizado.email });
      setMensagem('Dados atualizados com sucesso.');
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível salvar. Verifique sua conexão com a internet.',
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Tela>
      <View style={styles.topo}>
        <Avatar nome={salvo.nome} tamanho={84} />
        <Text style={styles.titulo}>{salvo.nome}</Text>
        <Text style={styles.email}>{salvo.email}</Text>
      </View>

      <CampoTexto rotulo="Nome" value={nome} onChangeText={setNome} maxLength={100} />
      <CampoTexto
        rotulo="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <CampoTexto
        rotulo="Telefone"
        value={telefone}
        onChangeText={setTelefone}
        keyboardType="phone-pad"
        maxLength={20}
      />

      <Text style={styles.secao}>Senha</Text>
      <Text style={styles.dica}>
        Para trocar o e-mail ou a senha, informe a senha atual. Deixe os campos de senha em branco
        se não quiser alterá-la.
      </Text>
      <CampoTexto
        rotulo="Senha atual"
        value={senhaAtual}
        onChangeText={setSenhaAtual}
        secureTextEntry
        autoCapitalize="none"
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

      {erro && <Aviso tipo="erro" texto={erro} />}
      {mensagem && <Aviso tipo="sucesso" texto={mensagem} />}

      <Botao titulo="Salvar alterações" onPress={handleSalvar} carregando={salvando} />

      <View style={styles.sair}>
        <Botao titulo="Sair" secundario onPress={sair} />
      </View>
    </Tela>
  );
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
    backgroundColor: cores.fundo,
  },
  topo: { alignItems: 'center', gap: 6, marginBottom: 8 },
  titulo: { fontSize: 22, fontWeight: '800', textAlign: 'center', color: cores.texto },
  email: { color: cores.textoSecundario },
  secao: { fontSize: 16, fontWeight: '700', marginTop: 8, color: cores.texto },
  dica: { color: cores.textoSecundario, lineHeight: 20 },
  erro: { color: cores.erro, textAlign: 'center' },
  sair: { marginTop: 12 },
});
