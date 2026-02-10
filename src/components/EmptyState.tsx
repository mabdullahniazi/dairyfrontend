interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-[fadeIn_0.4s_ease-out]">
      <span className="text-6xl mb-4">{icon}</span>
      <h3 className="text-lg font-bold text-stone-700 mb-1">{title}</h3>
      <p className="text-sm text-stone-400 max-w-xs">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-semibold text-sm transition-colors shadow-lg shadow-amber-600/20 active:scale-[0.97]"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
