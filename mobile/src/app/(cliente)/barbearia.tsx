import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Botao } from '@/components/Botao';
import { Cartao, TextoCartao } from '@/components/Cartao';
import { useCarregar } from '@/hooks/useCarregar';
import { consultarBarbearia } from '@/lib/barbearia';

// US Consulta de Informações da Barbearia (item 2.41): endereço, telefone e
// horário de funcionamento, sempre os dados mais atuais cadastrados pelo
// administrador. Sem cadastro, informa que não há informações (CT02).
export default function BarbeariaScreen() {
  const { dados, carregando, erro, recarregar } = useCarregar(consultarBarbearia);

  if (carregando && dados === null && !erro) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (erro) {
    return (
      <View style={styles.centro}>
        <Text style={styles.erro}>{erro}</Text>
        <Botao titulo="Tentar novamente" onPress={recarregar} />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.conteudo}
      refreshControl={<RefreshControl refreshing={carregando} onRefresh={recarregar} />}
    >
      {dados ? (
        <Cartao titulo={dados.nome}>
          <TextoCartao>Endereço: {dados.endereco}</TextoCartao>
          <TextoCartao>Telefone: {dados.telefone}</TextoCartao>
          <TextoCartao>Horário de funcionamento: {dados.horarioFuncionamento}</TextoCartao>
        </Cartao>
      ) : (
        <Text style={styles.vazio}>Não há informações da barbearia disponíveis no momento.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  conteudo: { padding: 16 },
  vazio: { textAlign: 'center', color: '#555', marginTop: 32 },
  erro: { color: '#c00', textAlign: 'center' },
});
