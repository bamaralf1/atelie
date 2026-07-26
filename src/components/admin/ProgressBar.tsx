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
    p < 25 ? 'from-atelie-textoMuted to-zinc-500' :
    p < 50 ? 'from-atelie-terracota to-atelie-dourado' :
    p < 75 ? 'from-atelie-dourado to-atelie-douradoClaro' :
    'from-atelie-douradoClaro to-emerald-400';

  const marcadores = [25, 50, 75];

  return (
    <div className="w-full">
      <div className={`relative w-full ${altura} bg-atelie-superficie2 rounded-full overflow-hidden border border-atelie-borda`}>
        <div
          className={`barra-progresso h-full rounded-full bg-gradient-to-r ${corGradiente}`}
          style={{ width: `${p}%` }}
        />
        {mostrarMarcadores && marcadores.map((m) => (
          <div
            key={m}
            className={`absolute top-0 h-full w-px ${p >= m ? 'bg-black/20' : 'bg-atelie-borda/50'}`}
            style={{ left: `${m}%` }}
          />
        ))}
      </div>
    </div>
  );
}
