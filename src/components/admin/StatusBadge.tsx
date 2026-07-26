import { corDoStatus } from '@/lib/utils';
import { corStatusDot } from '@/lib/utils';

export function StatusBadge({ status, tamanho = 'normal' }: { status: string; tamanho?: 'normal' | 'pequeno' }) {
  const escala = tamanho === 'pequeno' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';
  const dotScale = tamanho === 'pequeno' ? 'w-1 h-1' : 'w-1.5 h-1.5';

  return (
    <span
      className={`badge-status ${escala} border ${corDoStatus(status)}`}
    >
      <span className={`${dotScale} rounded-full ${corStatusDot(status)}`} />
      {status}
    </span>
  );
}
