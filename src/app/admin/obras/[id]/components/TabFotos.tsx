'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { FotoProgresso } from '@/lib/types';
import { formatarDataHora } from '@/lib/utils';
import { enviarFotoProgressoAction, removerFotoAction } from '../actions';
import { ImageCropper } from '@/components/ui/ImageCropper';

export function TabFotos({ obraId, fotosIniciais }: { obraId: string; fotosIniciais: FotoProgresso[] }) {
  const [fotos, setFotos] = useState(fotosIniciais);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [arrastando, setArrastando] = useState(false);
  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set());
  const [comparando, setComparando] = useState<string | null>(null);
  const [cropAberto, setCropAberto] = useState(false);
  const [arquivoCrop, setArquivoCrop] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setArrastando(true);
    else if (e.type === 'dragleave') setArrastando(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setArrastando(false);
    const arquivos = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    if (arquivos.length > 0) {
      setArquivoCrop(arquivos[0]);
      setCropAberto(true);
    }
  }, []);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setArquivoCrop(file);
      setCropAberto(true);
    }
  }

  async function handleUploadCropped(arquivoRecortado: File) {
    setCropAberto(false);
    setEnviando(true);
    setErro(null);

    const formData = new FormData();
    formData.set('foto', arquivoRecortado);
    formData.set('legenda', (document.querySelector('[name="legenda"]') as HTMLInputElement)?.value ?? '');
    formData.set('etapa', (document.querySelector('[name="etapa"]') as HTMLInputElement)?.value ?? '');

    const resultado = await enviarFotoProgressoAction(obraId, formData);
    if (resultado?.erro) {
      setErro(resultado.erro);
    } else {
      if (fileRef.current) fileRef.current.value = '';
    }
    setEnviando(false);
  }

  async function handleRemover(fotoId: string) {
    setFotos((prev) => prev.filter((f) => f.id !== fotoId));
    setSelecionadas((prev) => { const n = new Set(prev); n.delete(fotoId); return n; });
    await removerFotoAction(obraId, fotoId);
  }

  async function handleRemoverMultiplas() {
    for (const id of selecionadas) {
      setFotos((prev) => prev.filter((f) => f.id !== id));
      await removerFotoAction(obraId, id);
    }
    setSelecionadas(new Set());
  }

  function toggleSelecao(id: string) {
    setSelecionadas((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }

  return (
    <div className="max-w-3xl space-y-6">
      <ImageCropper
        aberto={cropAberto}
        arquivo={arquivoCrop}
        onConfirmar={handleUploadCropped}
        onFechar={() => { setCropAberto(false); setArquivoCrop(null); }}
      />

      {/* Zona de upload */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
          arrastando
            ? 'border-atelie-dourado bg-atelie-dourado/5 shadow-dourado-lg'
            : 'border-atelie-borda hover:border-atelie-dourado/40'
        }`}
      >
        <div className="space-y-3">
          <div className="flex flex-col items-center gap-2">
            <svg className={`w-10 h-10 ${arrastando ? 'text-atelie-douradoClaro' : 'text-atelie-textoMuted'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-atelie-textoMuted">
              {arrastando ? 'Solte a foto aqui' : 'Arraste uma foto ou clique para selecionar'}
            </p>
            <p className="text-[10px] text-atelie-textoMuted">
              PNG, JPG ou WebP · A foto será ajustada antes do upload
            </p>
          </div>

          <input
            ref={fileRef}
            type="file"
            name="foto"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={enviando}
            className="btn-dourado px-4 py-2 text-sm"
          >
            {enviando ? 'Enviando...' : 'Selecionar foto'}
          </button>

          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
            <input name="legenda" placeholder="Legenda" className="input-atelie text-sm" />
            <input name="etapa" placeholder="Etapa" className="input-atelie text-sm" />
          </div>
        </div>
        {erro && <p className="text-atelie-terracotaClaro text-sm mt-3">{erro}</p>}
      </div>

      {/* Barra de ações em massa */}
      {selecionadas.size > 0 && (
        <div className="flex items-center gap-3 bg-atelie-superficie border border-atelie-borda rounded-lg px-4 py-2 animate-fadeIn">
          <span className="text-sm text-atelie-textoMuted">{selecionadas.size} selecionada{selecionadas.size > 1 ? 's' : ''}</span>
          <button onClick={handleRemoverMultiplas} className="text-atelie-terracotaClaro hover:underline text-sm ml-auto">
            Remover selecionadas
          </button>
          <button onClick={() => setSelecionadas(new Set())} className="text-atelie-textoMuted hover:text-atelie-texto text-sm">
            Cancelar
          </button>
        </div>
      )}

      {/* Grid de fotos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {fotos.map((foto) => {
          const selecionada = selecionadas.has(foto.id);
          return (
            <div
              key={foto.id}
              className={`group relative bg-atelie-superficie border rounded-lg overflow-hidden transition-all duration-200 ${
                selecionada
                  ? 'border-atelie-dourado ring-1 ring-atelie-dourado'
                  : 'border-atelie-borda hover:border-atelie-dourado/40 hover:shadow-dourado'
              }`}
            >
              <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <input
                  type="checkbox"
                  checked={selecionada}
                  onChange={() => toggleSelecao(foto.id)}
                  className="w-4 h-4 accent-atelie-dourado cursor-pointer"
                />
              </div>

              <div className="relative h-36">
                <Image src={foto.url_foto} alt={foto.legenda ?? 'Foto'} fill className="object-cover" />
                <button
                  onClick={() => setComparando(comparando === foto.id ? null : foto.id)}
                  className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {comparando === foto.id ? 'Fechar' : 'Comparar'}
                </button>
              </div>
              <div className="p-2 text-xs">
                {foto.etapa && <p className="text-atelie-douradoClaro font-medium truncate">{foto.etapa}</p>}
                {foto.legenda && <p className="text-atelie-textoMuted truncate">{foto.legenda}</p>}
                <p className="text-atelie-textoMuted mt-0.5">{formatarDataHora(foto.data_upload)}</p>
                <button onClick={() => handleRemover(foto.id)} className="text-atelie-terracotaClaro hover:underline mt-1">
                  remover
                </button>
              </div>
            </div>
          );
        })}
        {fotos.length === 0 && (
          <p className="col-span-full text-atelie-textoMuted text-sm py-6 text-center">Nenhuma foto enviada ainda.</p>
        )}
      </div>

      {/* Comparação */}
      {comparando && fotos.length > 1 && (
        <div className="bg-atelie-superficie border border-atelie-borda rounded-lg p-4 animate-fadeIn">
          <p className="text-xs uppercase tracking-wide text-atelie-textoMuted mb-3">Comparação: antes / depois</p>
          <div className="grid grid-cols-2 gap-3">
            {fotos
              .filter((f) => f.id !== comparando)
              .slice(0, 1)
              .map((fotoAnterior) => (
                <div key={fotoAnterior.id}>
                  <p className="text-[10px] text-atelie-textoMuted mb-1">Anterior</p>
                  <div className="relative aspect-video rounded-md overflow-hidden border border-atelie-borda">
                    <Image src={fotoAnterior.url_foto} alt="Anterior" fill className="object-cover" />
                  </div>
                </div>
              ))}
            <div>
              <p className="text-[10px] text-atelie-textoMuted mb-1">Atual (selecionada)</p>
              <div className="relative aspect-video rounded-md overflow-hidden border border-atelie-dourado/50">
                {(() => {
                  const f = fotos.find((f) => f.id === comparando);
                  return f ? <Image src={f.url_foto} alt="Atual" fill className="object-cover" /> : null;
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
