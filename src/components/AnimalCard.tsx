import type { IAnimal } from '../lib/db';
import { useNavigate } from 'react-router-dom';

const typeEmojis: Record<string, string> = {
  cow: '🐄',
  buffalo: '🐃',
  goat: '🐐',
  sheep: '🐑',
};

const typeColors: Record<string, string> = {
  cow: 'bg-amber-50 border-amber-200',
  buffalo: 'bg-stone-100 border-stone-200',
  goat: 'bg-emerald-50 border-emerald-200',
  sheep: 'bg-blue-50 border-blue-200',
};

interface AnimalCardProps {
  animal: IAnimal;
}

export function AnimalCard({ animal }: AnimalCardProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/animals/${animal.id}`)}
      className={`
        w-full text-left ${typeColors[animal.type] || 'bg-stone-50 border-stone-200'}
        border rounded-2xl p-4 transition-all duration-200
        hover:shadow-lg hover:-translate-y-0.5
        active:scale-[0.98] active:shadow-md
      `}
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl">{typeEmojis[animal.type] || '🐾'}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-stone-800 text-base truncate">{animal.name}</h3>
          {animal.tagNumber && (
            <p className="text-xs text-stone-500 mt-0.5">Tag: {animal.tagNumber}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-medium capitalize px-2 py-0.5 rounded-full bg-white/60 text-stone-600">
              {animal.type}
            </span>
            {animal.age > 0 && (
              <span className="text-xs text-stone-400">
                {animal.age} {animal.age === 1 ? 'yr' : 'yrs'}
              </span>
            )}
          </div>
        </div>
        {!animal.synced && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
            Unsynced
          </span>
        )}
      </div>
    </button>
  );
}
