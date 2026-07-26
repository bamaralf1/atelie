import { corDoStatus } from '@/lib/utils';
import { corStatusDot } from '@/lib/utils';

export function StatusBadge({ status, tamanho = 'normal' }: { status: string; tamanho?: 'normal' | 'pequeno' }) {
  const escala = tamanho === 'pequeno' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${escala} rounded-full font-medium border ${corDoStatus(status)}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${corStatusDot(status)}`} />
      {status}
    </span>
  );
}
