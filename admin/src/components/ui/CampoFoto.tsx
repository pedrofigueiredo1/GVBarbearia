'use client';

import { useEffect, useRef, useState } from 'react';
import {
  TAMANHO_MAXIMO_DA_FOTO,
  TIPOS_DE_FOTO_ACEITOS,
} from '@/lib/fotos';
import type { AlteracaoDeFoto } from '@/types/foto';
import { Botao } from './Botao';

interface Props {
  // Endereço da foto já cadastrada (null se não tem).
  urlAtual: string | null;
  valor: AlteracaoDeFoto;
  onChange: (alteracao: AlteracaoDeFoto) => void;
}

// Escolha da foto no formulário. O quadro mostra a proporção padrão do app
// (3:4, em pé): a imagem é recortada para ela no servidor, então o que se vê
// aqui é o enquadramento que o cliente vai ver.
export function CampoFoto({ urlAtual, valor, onChange }: Props) {
  const entrada = useRef<HTMLInputElement>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [previa, setPrevia] = useState<string | null>(null);

  // Prévia da foto recém-escolhida, liberada da memória quando deixa de valer.
  useEffect(() => {
    if (valor.acao !== 'enviar') {
      setPrevia(null);
      return;
    }
    const url = URL.createObjectURL(valor.arquivo);
    setPrevia(url);
    return () => URL.revokeObjectURL(url);
  }, [valor]);

  function aoEscolher(arquivo: File | undefined) {
    if (!arquivo) return;
    if (!TIPOS_DE_FOTO_ACEITOS.includes(arquivo.type)) {
      setErro('Use uma imagem JPG, PNG ou WebP.');
      return;
    }
    if (arquivo.size > TAMANHO_MAXIMO_DA_FOTO) {
      setErro('A imagem tem mais de 8 MB. Escolha uma menor.');
      return;
    }
    setErro(null);
    onChange({ acao: 'enviar', arquivo });
  }

  const exibida = valor.acao === 'remover' ? null : (previa ?? urlAtual);
  // O segundo botão tira a foto atual, descarta a recém-escolhida ou desfaz a remoção.
  const rotuloDoSegundoBotao =
    valor.acao === 'remover' ? 'Desfazer' : valor.acao === 'enviar' ? 'Descartar' : urlAtual ? 'Remover' : null;

  return (
    <div>
      <span className="block text-sm font-medium mb-1">Foto</span>
      <div className="flex items-start gap-4">
        <div className="relative w-24 shrink-0 aspect-[3/4] overflow-hidden rounded-lg border border-borda bg-superficie-alta">
          {exibida ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={exibida} alt="Foto" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center px-2 text-center text-xs text-white/40">
              Sem foto
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <input
            ref={entrada}
            type="file"
            accept={TIPOS_DE_FOTO_ACEITOS.join(',')}
            className="hidden"
            onChange={(e) => {
              aoEscolher(e.target.files?.[0]);
              e.target.value = ''; // permite escolher o mesmo arquivo de novo
            }}
          />
          <div className="flex flex-wrap gap-2">
            <Botao
              type="button"
              variante="secundario"
              tamanho="pequeno"
              onClick={() => entrada.current?.click()}
            >
              {exibida ? 'Trocar foto' : 'Escolher foto'}
            </Botao>
            {rotuloDoSegundoBotao && (
              <Botao
                type="button"
                variante="fantasma"
                tamanho="pequeno"
                onClick={() => {
                  setErro(null);
                  onChange(valor.acao === 'manter' ? { acao: 'remover' } : { acao: 'manter' });
                }}
              >
                {rotuloDoSegundoBotao}
              </Botao>
            )}
          </div>
          <p className="text-xs text-white/50">
            JPG, PNG ou WebP, até 8 MB. Qualquer tamanho: a foto é ajustada ao formato padrão em pé
            (3:4), igual para todos.
          </p>
          {erro && <p className="text-xs text-red-500">{erro}</p>}
        </div>
      </div>
    </div>
  );
}
