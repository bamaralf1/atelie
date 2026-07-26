export function ProgressBar({
  percentual,
  tamanho = 'normal',
}: {
  percentual: number;
  tamanho?: 'normal' | 'grande';
}) {
  const altura = tamanho === 'grande' ? 'h-3' : 'h-1.5';

  return (
    <div className="w-full">
      <div className={`w-full ${altura} bg-atelie-superficie2 rounded-full overflow-hidden border border-atelie-borda`}>
        <div
          className="barra-progresso h-full rounded-full bg-gradient-to-r from-atelie-terracota to-atelie-dourado"
          style={{ width: `${Math.min(100, Math.max(0, percentual))}%` }}
        />
      </div>
    </div>
  );
}
