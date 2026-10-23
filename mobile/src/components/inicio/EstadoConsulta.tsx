import { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Botao } from '@/components/Botao';
import { cores } from '@/tema';

export interface Consulta<T> {
  dados: T | null;
  carregando: boolean;
  erro: string | null;
  recarregar: () => void;
}

interface Props<T> {
  consulta: Consulta<T>;
  // Mensagem quando a lista volta vazia (só vale para consultas que devolvem lista).
  mensagemVazia: string;
  children: (dados: NonNullable<T>) => ReactNode;
}

// Estados de uma consulta dentro de uma aba da Home: carregando na primeira
// vez, erro com "Tentar novamente", lista vazia e, por fim, o conteúdo.
export function EstadoConsulta<T>({ consulta, mensagemVazia, children }: Props<T>) {
  const { dados, carregando, erro, recarregar } = consulta;

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

  if (dados === null || (Array.isArray(dados) && dados.length === 0)) {
    return <Text style={styles.vazio}>{mensagemVazia}</Text>;
  }

  return <>{children(dados as NonNullable<T>)}</>;
}

const styles = StyleSheet.create({
  centro: { alignItems: 'center', gap: 12, paddingVertical: 32 },
  erro: { color: cores.erro, textAlign: 'center' },
  vazio: { textAlign: 'center', color: cores.textoSecundario, paddingVertical: 32 },
});
