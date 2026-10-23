import { ReactElement } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { cores } from '@/tema';
import { Botao } from './Botao';

interface Props<T> {
  dados: T[] | null;
  carregando: boolean;
  erro: string | null;
  recarregar: () => void;
  mensagemVazia: string;
  chave: (item: T) => string;
  renderItem: (item: T) => ReactElement;
}

// Tela de listagem padrão: indicador na primeira carga, mensagem de erro com
// "Tentar novamente", mensagem quando não há itens e puxar-para-atualizar.
export function ListaDados<T>({
  dados,
  carregando,
  erro,
  recarregar,
  mensagemVazia,
  chave,
  renderItem,
}: Props<T>) {
  if (carregando && dados === null) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={cores.cobre} />
      </View>
    );
  }

  if (erro && dados === null) {
    return (
      <View style={styles.centro}>
        <Text style={styles.erro}>{erro}</Text>
        <Botao titulo="Tentar novamente" onPress={recarregar} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.fundo}
      data={dados ?? []}
      keyExtractor={chave}
      renderItem={({ item }) => renderItem(item)}
      contentContainerStyle={styles.lista}
      refreshControl={
        <RefreshControl
          refreshing={carregando}
          onRefresh={recarregar}
          tintColor={cores.cobre}
          colors={[cores.cobre]}
          progressBackgroundColor={cores.superficieAlta}
        />
      }
      ListEmptyComponent={<Text style={styles.vazio}>{mensagemVazia}</Text>}
    />
  );
}

const styles = StyleSheet.create({
  fundo: { backgroundColor: cores.fundo },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
    backgroundColor: cores.fundo,
  },
  lista: { padding: 16, gap: 12 },
  vazio: { textAlign: 'center', color: cores.textoSecundario, marginTop: 32 },
  erro: { color: cores.erro, textAlign: 'center' },
});
