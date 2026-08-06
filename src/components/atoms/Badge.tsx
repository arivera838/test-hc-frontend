interface BadgeProps {
  status: 'EXITOSO' | 'RECHAZADO' | 'IMPRESION' | 'REIMPRESIÓN' | 'REIMPRESION' | string;
}

export function Badge({ status }: BadgeProps) {
  const normalized = status.toUpperCase();

  const styles: Record<string, string> = {
    EXITOSO: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    RECHAZADO: 'bg-rose-50 text-rose-700 border-rose-200',
    IMPRESION: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    REIMPRESION: 'bg-amber-50 text-amber-700 border-amber-200',
    REIMPRESIÓN: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  const currentStyle = styles[normalized] || 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentStyle}`}>
      {status}
    </span>
  );
}
