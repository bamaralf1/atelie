import { corDoStatus } from '@/lib/utils';

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${corDoStatus(status)}`}
    >
      {status}
    </span>
  );
}
