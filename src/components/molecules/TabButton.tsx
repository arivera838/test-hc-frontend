interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: string;
}

export function TabButton({ active, onClick, label, icon }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm rounded-lg transition-all duration-200 focus:outline-none ${
        active
          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
          : 'bg-white text-slate-500 hover:text-slate-800 border border-slate-100 hover:border-slate-200'
      }`}
    >
      {icon && <span>{icon}</span>}
      {label}
    </button>
  );
}
