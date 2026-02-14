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
    <div className="flex flex-col items-center justify-center py-10 sm:py-16 px-4 sm:px-6 text-center animate-[fadeIn_0.4s_ease-out]">
      <span className="text-5xl sm:text-6xl mb-3 sm:mb-4">{icon}</span>
      <h3 className="text-base sm:text-xl font-bold text-sky-700 mb-1">{title}</h3>
      <p className="text-md text-stone-500 max-w-xs">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 px-16 py-3 bg-gradient-to-br from-sky-500 to-sky-700 hover:bg-sky-700 text-white rounded-2xl font-semibold text-sm transition-colors shadow-lg shadow-sky-600/30 active:scale-[0.97]"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
