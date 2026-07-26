'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { criarObraAction } from './actions';

export default function NovaObraPage() {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

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

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl mb-1">Nova obra</h1>
      <p className="text-atelie-textoMuted text-sm mb-8">
        Cadastre uma nova pintura para começar a acompanhar o progresso.
      </p>

      <form action={handleSubmit} className="space-y-5 bg-atelie-superficie border border-atelie-borda rounded-lg p-6">
        <Campo label="Título da obra" name="titulo" required placeholder="Ex: Retrato ao entardecer" />

        <div className="grid grid-cols-2 gap-4">
          <Campo label="Nome do cliente" name="cliente_nome" required placeholder="Ex: Maria Silva" />
          <Campo label="E-mail do cliente" name="cliente_email" type="email" placeholder="maria@email.com" />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wide text-atelie-textoMuted mb-2">Descrição</label>
          <textarea
            name="descricao"
            rows={3}
            className="w-full bg-atelie-fundo border border-atelie-borda rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-atelie-dourado/60"
            placeholder="Detalhes sobre a encomenda, técnica, dimensões..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Campo label="Orçamento total (R$)" name="orcamento_total" type="number" step="0.01" placeholder="0,00" />
          <Campo label="Estimativa de conclusão" name="estimativa_conclusao" type="date" />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wide text-atelie-textoMuted mb-2">
            Imagem de referência
          </label>
          <input
            type="file"
            name="imagem_referencia"
            accept="image/*"
            className="w-full text-sm text-atelie-textoMuted file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-atelie-dourado/20 file:text-atelie-douradoClaro file:cursor-pointer"
          />
        </div>

        {erro && <p className="text-atelie-terracotaClaro text-sm">{erro}</p>}

        <button
          type="submit"
          disabled={enviando}
          className="w-full bg-atelie-dourado text-atelie-fundo font-medium rounded-md py-2.5 hover:bg-atelie-douradoClaro transition-colors disabled:opacity-50"
        >
          {enviando ? 'Salvando...' : 'Salvar e gerar link de acompanhamento'}
        </button>
      </form>
    </div>
  );
}

function Campo({
  label,
  name,
  type = 'text',
  required = false,
  placeholder,
  step,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  step?: string;
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wide text-atelie-textoMuted mb-2">{label}</label>
      <input
        type={type}
        name={name}
        required={required}
        step={step}
        placeholder={placeholder}
        className="w-full bg-atelie-fundo border border-atelie-borda rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-atelie-dourado/60"
      />
    </div>
  );
}
