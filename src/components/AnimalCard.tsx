interface Animal {
  id?: number;
  name: string;
  tagNumber: string;
  type: 'cow' | 'buffalo' | 'goat' | 'sheep';
  age: number;
  synced?: boolean;
}

interface AnimalCardProps {
  animal: Animal;
  onClick: () => void;
}

const typeEmojis: Record<string, string> = {
  cow: '🐄', buffalo: '🐃', goat: '🐐', sheep: '🐑',
};

const typeColors: Record<string, string> = {
  cow: 'bg-amber-50/80 border-amber-200/40',
  buffalo: 'bg-stone-100/80 border-stone-200/40',
  goat: 'bg-emerald-50/80 border-emerald-200/40',
  sheep: 'bg-blue-50/80 border-blue-200/40',
};

export function AnimalCard({ animal, onClick }: AnimalCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        bg-white/60 w-full text-left rounded-2xl p-4 transition-all duration-200
        hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]
        ${typeColors[animal.type] || 'border-stone-200/40'}
      `}
    >
      <div className="flex items-center gap-3">
        <span className="text-4xl">{typeEmojis[animal.type] || '🐾'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-stone-800 truncate text-2xl capitalize">{animal.name}</h3>
            {!animal.synced && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium flex-shrink-0">
                un-synced
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 flex-wrap">
            <span className="text-sm text-stone-800 capitalize">{animal.type}</span>
            {animal.tagNumber && (
              <>
                <span className="text-stone-500">/</span>
                <span className="text-sm text-stone-800">{animal.tagNumber}</span>
              </>
            )}
            {animal.age > 0 && (
              <>
                <span className="text-stone-500">/</span>
                <span className="text-sm text-stone-800">{animal.age}y</span>
              </>
            )}
          </div>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-stone-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </button>
  );
}
