export function ProgressBar({
  percentual,
  tamanho = 'normal',
  mostrarMarcadores,
}: {
  percentual: number;
  tamanho?: 'normal' | 'grande';
  mostrarMarcadores?: boolean;
}) {
  const p = Math.min(100, Math.max(0, percentual));
  const altura = tamanho === 'grande' ? 'h-3' : 'h-1.5';

  const corGradiente =
    p < 25 ? 'from-atelie-textoMuted/60 to-zinc-500' :
    p < 50 ? 'from-atelie-terracota to-atelie-dourado' :
    p < 75 ? 'from-atelie-dourado to-atelie-douradoClaro' :
    'from-atelie-douradoClaro to-emerald-400';

  const marcadores = [25, 50, 75];

  return (
    <div className="w-full">
      <div className={`relative w-full ${altura} bg-atelie-superficie2 rounded-full overflow-hidden`}>
        <div className="absolute inset-0 rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]" />
        <div
          className={`barra-progresso h-full rounded-full bg-gradient-to-r ${corGradiente} relative`}
          style={{ width: `${p}%` }}
        />
        {tamanho === 'grande' && p > 2 && p < 100 && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-atelie-dourado shadow-[0_0_14px_rgba(198,161,91,0.6)] animate-pulseDot"
            style={{ left: `calc(${p}% - 7px)` }}
          />
        )}
        {mostrarMarcadores && marcadores.map((m) => (
          <div
            key={m}
            className={`absolute top-0 h-full w-px ${p >= m ? 'bg-black/20' : 'bg-atelie-borda/30'}`}
            style={{ left: `${m}%` }}
          />
        ))}
      </div>
    </div>
  );
}
