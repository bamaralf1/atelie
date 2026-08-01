export default function ObraNaoEncontrada() {
  return (
    <div className="min-h-screen bg-atelie-fundo flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="font-display text-6xl text-atelie-dourado mb-4 italic">Atelier Bruno Amaral</p>
        <h1 className="text-2xl font-display mb-2">Link não encontrado</h1>
        <p className="text-atelie-textoMuted text-sm">
          Este link de acompanhamento não existe ou foi desativado. Verifique com o artista
          se o endereço foi copiado corretamente.
        </p>
      </div>
    </div>
  );
}
