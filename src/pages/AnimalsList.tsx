import { useState } from 'react';
import { useAnimals } from '../hooks/useAnimals';
import { useNavigate } from 'react-router-dom';
import { AnimalCard } from '../components/AnimalCard';
import { EmptyState } from '../components/EmptyState';

const filters = ['all', 'cow', 'buffalo', 'goat', 'sheep'] as const;
const filterEmojis: Record<string, string> = {
  all: '🏷️', cow: '🐄', buffalo: '🐃', goat: '🐐', sheep: '🐑',
};

export function AnimalsList() {
  const { animals, loading } = useAnimals();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filtered = activeFilter === 'all'
    ? animals
    : animals.filter(a => a.type === activeFilter);

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-4 animate-[fadeIn_0.3s_ease-out]">
      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`
              flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold capitalize whitespace-nowrap transition-all duration-200
              ${activeFilter === f
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                : 'glass-card text-stone-600 hover:bg-white/90'
              }
            `}
          >
            <span>{filterEmojis[f]}</span>
            {f}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-6">
          <EmptyState
            icon="🐄"
            title={activeFilter === 'all' ? 'No Animals Yet' : `No ${activeFilter}s`}
            description={activeFilter === 'all' ? 'Add your first animal to get started.' : `You haven't added any ${activeFilter}s yet.`}
            action={activeFilter === 'all' ? { label: '+ Add Animal', onClick: () => navigate('/animals/add') } : undefined}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(animal => (
            <AnimalCard
              key={animal.id}
              animal={animal}
              onClick={() => navigate(`/animals/${animal.id}`)}
            />
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => navigate('/animals/add')}
        className="fixed bottom-24 md:bottom-8 right-4 md:right-8 w-14 h-14 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl shadow-2xl shadow-amber-600/30 flex items-center justify-center text-2xl font-light transition-all duration-200 active:scale-90 z-20"
      >
        +
      </button>
    </div>
  );
}
