import { corDoStatus } from '@/lib/utils';
import { corStatusDot } from '@/lib/utils';

type TamanhoBadge = 'pequeno' | 'normal' | 'grande';

export function StatusBadge({ status, tamanho = 'normal' }: { status: string; tamanho?: TamanhoBadge }) {
  const escala = {
    pequeno: 'text-[10px] px-2 py-0.5',
    normal: 'text-xs px-2.5 py-1',
    grande: 'text-sm px-4 py-1.5',
  }[tamanho];

  const glow = tamanho === 'grande' ? 'shadow-[0_0_12px_rgba(198,161,91,0.2)]' : '';

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${escala} rounded-full font-medium border ${corDoStatus(status)} ${glow}`}
    >
      <span className={`${tamanho === 'grande' ? 'w-2 h-2' : 'w-1.5 h-1.5'} rounded-full ${corStatusDot(status)}`} />
      {status}
    </span>
  );
}
