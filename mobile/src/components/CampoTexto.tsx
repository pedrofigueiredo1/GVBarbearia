import { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { cores, raio } from '@/tema';

interface Props extends TextInputProps {
  rotulo: string;
}

// Campo de formulário com rótulo. Repassa todas as props do TextInput
// (teclado, senha, limite de caracteres...). O contorno fica cobre em foco.
export function CampoTexto({ rotulo, style, onFocus, onBlur, ...props }: Props) {
  const [focado, setFocado] = useState(false);

  return (
    <View style={styles.grupo}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <TextInput
        accessibilityLabel={rotulo}
        placeholderTextColor={cores.textoSecundario}
        selectionColor={cores.cobre}
        style={[styles.input, focado && styles.focado, style]}
        onFocus={(e) => {
          setFocado(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocado(false);
          onBlur?.(e);
        }}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  grupo: { gap: 6 },
  rotulo: { fontSize: 14, fontWeight: '600', color: cores.textoSecundario },
  input: {
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio.medio,
    backgroundColor: cores.superficie,
    color: cores.texto,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  focado: { borderColor: cores.cobre },
});
