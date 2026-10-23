import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Link, router } from 'expo-router';
import { Aviso } from '@/components/Aviso';
import { Botao } from '@/components/Botao';
import { CabecalhoMarca } from '@/components/CabecalhoMarca';
import { CampoTexto } from '@/components/CampoTexto';
import { Tela } from '@/components/Tela';
import { cores } from '@/tema';
import { ApiError } from '@/lib/api';
import { solicitarRecuperacaoSenha } from '@/lib/auth-cliente';

// US Recuperação de Senha de Cliente (item 2.39): o app mostra sempre a mesma
// mensagem, exista o e-mail ou não (CT02), e leva à tela do código.
export default function EsqueciSenhaScreen() {
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleEnviar() {
    setErro(null);
    if (!email.trim()) {
      setErro('Informe o e-mail cadastrado.');
      return;
    }

    setEnviando(true);
    try {
      const resposta = await solicitarRecuperacaoSenha(email.trim());
      setMensagem(resposta.mensagem);
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível enviar. Verifique sua conexão com a internet.',
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Tela>
      <CabecalhoMarca
        titulo="Recuperar senha"
        subtitulo="Informe o e-mail cadastrado. Enviaremos um código de 6 dígitos, válido por 15 minutos."
      />

      <CampoTexto
        rotulo="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />

      {erro && <Aviso tipo="erro" texto={erro} />}
      {mensagem && <Aviso tipo="sucesso" texto={mensagem} />}

      <Botao titulo="Enviar código" onPress={handleEnviar} carregando={enviando} />

      {mensagem && (
        <Botao
          titulo="Já recebi o código"
          secundario
          onPress={() => router.push({ pathname: '/redefinir-senha', params: { email: email.trim() } })}
        />
      )}

      <Link href="/login" style={styles.link}>
        Voltar para o login
      </Link>
    </Tela>
  );
}

const styles = StyleSheet.create({
  link: { textAlign: 'center', color: cores.cobre, fontWeight: '600', paddingVertical: 6 },
});
