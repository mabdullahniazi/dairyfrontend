import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, getAnimalEmoji, type Animal } from '../db/database';
import { SkeletonList } from '../components/Loader';

type AnimalFilter = 'all' | 'cow' | 'buffalo' | 'goat' | 'sheep';

export default function AnimalsPage() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<AnimalFilter>('all');

  useEffect(() => {
    loadAnimals();
  }, []);

  const loadAnimals = async () => {
    try {
      const all = await db.animals.orderBy('createdAt').reverse().toArray();
      setAnimals(all);
    } catch (err) {
      console.error('Failed to load animals:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnimals = filter === 'all' 
    ? animals 
    : animals.filter(a => a.type === filter);

  const counts = {
    all: animals.length,
    cow: animals.filter(a => a.type === 'cow').length,
    buffalo: animals.filter(a => a.type === 'buffalo').length,
    goat: animals.filter(a => a.type === 'goat').length,
    sheep: animals.filter(a => a.type === 'sheep').length,
  };

  if (loading) {
    return (
      <div>
        <div className="page-title">
          <h1>🐄 Animals</h1>
        </div>
        <SkeletonList count={4} />
      </div>
    );
  }

  return (
    <div>
      <div className="page-title">
        <h1>🐄 Animals</h1>
        <p className="page-subtitle">{animals.length} total animals in your farm</p>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {(['all', 'cow', 'buffalo', 'goat', 'sheep'] as AnimalFilter[]).map(type => (
          <button
            key={type}
            className={`filter-tab ${filter === type ? 'active' : ''}`}
            onClick={() => setFilter(type)}
          >
            {type === 'all' ? '🏠 All' : `${getAnimalEmoji(type)} ${counts[type]}`}
          </button>
        ))}
      </div>

      {/* Animal List */}
      {filteredAnimals.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">{filter === 'all' ? '🐄' : getAnimalEmoji(filter)}</div>
          <h3 className="empty-title">
            {filter === 'all' ? 'No Animals Yet' : `No ${filter}s yet`}
          </h3>
          <p className="empty-text">
            {filter === 'all' 
              ? 'Add your first animal to get started.' 
              : `You haven't added any ${filter}s to your farm.`}
          </p>
          <Link to="/animals/add" className="btn btn-primary">
            + Add Animal
          </Link>
        </div>
      ) : (
        <div className="animal-list">
          {filteredAnimals.map(animal => (
            <Link
              key={animal.id}
              to={`/animals/${animal.id}`}
              className="animal-item"
            >
              <div className="animal-avatar">{getAnimalEmoji(animal.type)}</div>
              <div className="animal-info">
                <div className="animal-name">
                  {animal.name}
                  {animal.tagNumber && (
                    <span className="text-muted" style={{ fontWeight: 400, fontSize: '0.875rem' }}>
                      {' '}#{animal.tagNumber}
                    </span>
                  )}
                </div>
                <div className="animal-meta">
                  {animal.type} • {animal.age} year{animal.age !== 1 ? 's' : ''} old
                  {!animal.synced && ' • ⏳ Not synced'}
                </div>
              </div>
              <span className="animal-arrow">→</span>
            </Link>
          ))}
        </div>
      )}

      {/* FAB - Add Animal */}
      <Link to="/animals/add" className="fab">+</Link>
    </div>
  );
}
