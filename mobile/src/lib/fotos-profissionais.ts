import type { ImageSourcePropType } from 'react-native';

// Fotos dos barbeiros, guardadas no próprio app e achadas pelo primeiro nome
// cadastrado no painel. O cadastro de profissional ainda não tem campo de
// foto; um profissional novo, sem foto aqui, aparece com as iniciais.
const FOTOS: Record<string, ImageSourcePropType> = {
  gabriel: require('../../assets/images/prof-gabriel.jpg'),
  bruno: require('../../assets/images/prof-bruno.jpg'),
  wesley: require('../../assets/images/prof-wesley.jpg'),
};

export function fotoDoProfissional(nome: string): ImageSourcePropType | undefined {
  const primeiroNome = nome
    .trim()
    .split(/\s+/)[0]
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
  return FOTOS[primeiroNome];
}
