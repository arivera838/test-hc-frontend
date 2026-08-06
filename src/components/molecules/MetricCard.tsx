interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  variant?: 'normal' | 'success' | 'danger' | 'warning';
}

export function MetricCard({ title, value, description, variant = 'normal' }: MetricCardProps) {
  const borderStyles = {
    normal: 'border-slate-100 bg-white',
    success: 'border-emerald-100 bg-emerald-50/30',
    danger: 'border-rose-100 bg-rose-50/30',
    warning: 'border-amber-100 bg-amber-50/30',
  };

  const textStyles = {
    normal: 'text-indigo-600',
    success: 'text-emerald-600',
    danger: 'text-rose-600',
    warning: 'text-amber-600',
  };

  return (
    <div className={`p-5 rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-md ${borderStyles[variant]}`}>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
      <p className={`text-3xl font-extrabold mt-2 tracking-tight ${textStyles[variant]}`}>{value}</p>
      {description && <p className="text-xs text-slate-500 mt-1 font-medium">{description}</p>}
    </div>
  );
}
