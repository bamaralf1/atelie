'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { criarObraAction } from './actions';

export default function NovaObraPage() {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [previewRef, setPreviewRef] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(formData: FormData) {
    setEnviando(true);
    setErro(null);
    const resultado = await criarObraAction(formData);
    if (resultado?.erro) {
      setErro(resultado.erro);
      setEnviando(false);
      return;
    }
    router.push(`/admin/obras/${resultado.id}`);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewRef(url);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-1">
        <button
          onClick={() => router.back()}
          className="text-atelie-textoMuted hover:text-atelie-texto transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-display text-3xl">Nova obra</h1>
      </div>
      <p className="text-atelie-textoMuted text-sm mb-8 ml-8">
        Cadastre uma nova pintura para começar a acompanhar o progresso.
      </p>

      <form action={handleSubmit} className="space-y-5 bg-atelie-superficie border border-atelie-borda rounded-lg p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs uppercase tracking-wide text-atelie-textoMuted mb-2">Título da obra *</label>
            <input
              name="titulo"
              required
              placeholder="Ex: Retrato ao entardecer"
              className="input-atelie"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs uppercase tracking-wide text-atelie-textoMuted mb-2">Nome do cliente *</label>
            <input
              name="cliente_nome"
              required
              placeholder="Ex: Maria Silva"
              className="input-atelie"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs uppercase tracking-wide text-atelie-textoMuted mb-2">E-mail do cliente</label>
            <input
              name="cliente_email"
              type="email"
              placeholder="maria@email.com"
              className="input-atelie"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs uppercase tracking-wide text-atelie-textoMuted mb-2">Orçamento total (R$)</label>
            <input
              name="orcamento_total"
              type="number"
              step="0.01"
              placeholder="0,00"
              className="input-atelie"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wide text-atelie-textoMuted mb-2">Descrição</label>
          <textarea
            name="descricao"
            rows={3}
            className="input-atelie resize-none"
            placeholder="Detalhes sobre a encomenda, técnica, dimensões..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wide text-atelie-textoMuted mb-2">Estimativa de conclusão</label>
            <input
              name="estimativa_conclusao"
              type="date"
              className="input-atelie"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wide text-atelie-textoMuted mb-2">
            Imagem de referência
          </label>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <input
                ref={fileRef}
                type="file"
                name="imagem_referencia"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-sm text-atelie-textoMuted file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-atelie-dourado/20 file:text-atelie-douradoClaro file:cursor-pointer file:hover:bg-atelie-dourado/30 file:transition-colors"
              />
            </div>
            {previewRef && (
              <div className="relative w-20 h-20 rounded-md overflow-hidden border border-atelie-borda shrink-0">
                <img src={previewRef} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setPreviewRef(null);
                    if (fileRef.current) fileRef.current.value = '';
                  }}
                  className="absolute top-0.5 right-0.5 bg-black/60 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        {erro && (
          <div className="bg-atelie-terracota/10 border border-atelie-terracota/30 rounded-md px-4 py-2">
            <p className="text-atelie-terracotaClaro text-sm">{erro}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="w-full btn-dourado py-2.5"
        >
          {enviando ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Salvando...
            </span>
          ) : 'Salvar e gerar link de acompanhamento'}
        </button>
      </form>
    </div>
  );
}
