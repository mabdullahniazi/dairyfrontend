import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnimals } from '../hooks/useAnimals';
import { AnimalCard } from '../components/AnimalCard';
import { EmptyState } from '../components/EmptyState';

const types = ['all', 'cow', 'buffalo', 'goat', 'sheep'] as const;
const typeLabels: Record<string, string> = {
  all: '🐾 All',
  cow: '🐄 Cows',
  buffalo: '🐃 Buffalo',
  goat: '🐐 Goats',
  sheep: '🐑 Sheep',
};

export function AnimalsList() {
  const [filter, setFilter] = useState<string>('all');
  const { animals, loading } = useAnimals(filter);
  const navigate = useNavigate();

  return (
    <div className="px-5 pt-4 animate-[fadeIn_0.3s_ease-out]">
      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar mb-2">
        {types.map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`
              flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200
              ${filter === type
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }
            `}
          >
            {typeLabels[type]}
          </button>
        ))}
      </div>

      {/* Animals Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : animals.length === 0 ? (
        <EmptyState
          icon={filter !== 'all' ? typeLabels[filter]?.split(' ')[0] || '🐾' : '🐾'}
          title={filter !== 'all' ? `No ${filter}s yet` : 'No animals yet'}
          description="Add your livestock to start tracking their daily production and health."
          action={{ label: '+ Add Animal', onClick: () => navigate('/animals/add') }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {animals.map(animal => (
            <AnimalCard key={animal.id} animal={animal} />
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => navigate('/animals/add')}
        className="fixed bottom-24 right-4 sm:right-auto sm:left-1/2 sm:translate-x-[calc(256px-56px)] w-14 h-14 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl shadow-2xl shadow-amber-600/30 flex items-center justify-center text-2xl font-light transition-all duration-200 active:scale-90 z-20"
      >
        +
      </button>
    </div>
  );
}
