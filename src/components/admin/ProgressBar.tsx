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
  const altura = tamanho === 'grande' ? 'h-2.5' : 'h-1.5';

  const corGradiente =
    p < 25 ? 'from-zinc-500/50 to-zinc-400/50' :
    p < 50 ? 'from-atelie-terracota to-atelie-dourado' :
    p < 75 ? 'from-atelie-dourado to-atelie-douradoClaro' :
    'from-atelie-douradoClaro to-emerald-400';

  const marcadores = [25, 50, 75];

  return (
    <div className="w-full">
      <div className={`relative w-full ${altura} bg-white/5 rounded-full overflow-hidden`}>
        <div
          className={`barra-progresso h-full rounded-full bg-gradient-to-r ${corGradiente}`}
          style={{ width: `${p}%` }}
        />
        {mostrarMarcadores && marcadores.map((m) => (
          <div
            key={m}
            className={`absolute top-0 h-full w-px ${p >= m ? 'bg-black/30' : 'bg-white/5'}`}
            style={{ left: `${m}%` }}
          />
        ))}
      </div>
    </div>
  );
}
