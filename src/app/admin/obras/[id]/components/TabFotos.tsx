'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { FotoProgresso } from '@/lib/types';
import { formatarDataHora } from '@/lib/utils';
import { enviarFotoProgressoAction, removerFotoAction } from '../actions';

export function TabFotos({ obraId, fotosIniciais }: { obraId: string; fotosIniciais: FotoProgresso[] }) {
  const [fotos, setFotos] = useState(fotosIniciais);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setEnviando(true);
    setErro(null);
    const resultado = await enviarFotoProgressoAction(obraId, formData);
    if (resultado?.erro) {
      setErro(resultado.erro);
    } else {
      formRef.current?.reset();
      // A imagem publicada fica visível após o revalidatePath recarregar o server component pai;
      // aqui apenas fechamos o estado de loading.
    }
    setEnviando(false);
  }

  async function handleRemover(fotoId: string) {
    setFotos((prev) => prev.filter((f) => f.id !== fotoId));
    await removerFotoAction(obraId, fotoId);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <form
        ref={formRef}
        action={handleSubmit}
        className="bg-atelie-superficie border border-atelie-borda rounded-lg p-5 space-y-3"
      >
        <div>
          <label className="block text-xs text-atelie-textoMuted mb-1">Foto</label>
          <input
            type="file"
            name="foto"
            accept="image/*"
            required
            className="w-full text-sm text-atelie-textoMuted file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-atelie-dourado/20 file:text-atelie-douradoClaro file:cursor-pointer"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-atelie-textoMuted mb-1">Legenda</label>
            <input name="legenda" className="w-full bg-atelie-fundo border border-atelie-borda rounded-md px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-atelie-textoMuted mb-1">Etapa</label>
            <input name="etapa" placeholder="Ex: Base de cores" className="w-full bg-atelie-fundo border border-atelie-borda rounded-md px-2 py-1.5 text-sm" />
          </div>
        </div>
        {erro && <p className="text-atelie-terracotaClaro text-sm">{erro}</p>}
        <button
          type="submit"
          disabled={enviando}
          className="bg-atelie-dourado text-atelie-fundo rounded-md px-4 py-2 text-sm font-medium hover:bg-atelie-douradoClaro transition-colors disabled:opacity-50"
        >
          {enviando ? 'Enviando...' : 'Enviar foto (torna-se a foto de destaque)'}
        </button>
      </form>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {fotos.map((foto) => (
          <div key={foto.id} className="bg-atelie-superficie border border-atelie-borda rounded-lg overflow-hidden">
            <div className="relative h-32">
              <Image src={foto.url_foto} alt={foto.legenda ?? 'Foto de progresso'} fill className="object-cover" />
            </div>
            <div className="p-2 text-xs">
              {foto.etapa && <p className="text-atelie-douradoClaro font-medium">{foto.etapa}</p>}
              {foto.legenda && <p className="text-atelie-textoMuted">{foto.legenda}</p>}
              <p className="text-atelie-textoMuted mt-1">{formatarDataHora(foto.data_upload)}</p>
              <button onClick={() => handleRemover(foto.id)} className="text-atelie-terracotaClaro hover:underline mt-1">
                remover
              </button>
            </div>
          </div>
        ))}
        {fotos.length === 0 && (
          <p className="col-span-full text-atelie-textoMuted text-sm py-6 text-center">Nenhuma foto enviada ainda.</p>
        )}
      </div>
    </div>
  );
}
