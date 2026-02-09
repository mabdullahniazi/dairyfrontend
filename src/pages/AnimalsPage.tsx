import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, type Animal, getAnimalEmoji } from '../db/database';
import { SkeletonList } from '../components/Loader';

export default function AnimalsPage() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadAnimals();
  }, []);

  const loadAnimals = async () => {
    try {
      const all = await db.animals.toArray();
      setAnimals(all);
    } catch (err) {
      console.error('Failed to load animals:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === 'all' 
    ? animals 
    : animals.filter(a => a.type === filter);

  const types = ['all', ...new Set(animals.map(a => a.type))];

  // Calculate stats per animal (mock data for now)
  const getAnimalStats = (animal: Animal) => {
    return {
      milk: Math.floor(Math.random() * 20),
      age: animal.age || 0,
      reports: Math.floor(Math.random() * 30),
    };
  };

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h2>Animals</h2>
            <p className="text-muted">Loading...</p>
          </div>
        </div>
        <SkeletonList count={4} />
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <p className="text-muted" style={{ marginTop: '4px' }}>
            {animals.length} animal{animals.length !== 1 ? 's' : ''} registered
          </p>
        </div>
        <Link to="/animals/add" className="btn btn-primary">
          ➕ Add Animal
        </Link>
      </div>

      {/* Filter Tabs */}
      {types.length > 1 && (
        <div className="filter-tabs">
          {types.map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`filter-tab ${filter === type ? 'active' : ''}`}
            >
              {type === 'all' ? 'All' : (
                <>
                  {getAnimalEmoji(type)} {type.charAt(0).toUpperCase() + type.slice(1)}
                </>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Animals Grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🐄</div>
          <h3 className="empty-title">No animals yet</h3>
          <p className="empty-text">
            Get started by adding your first animal to track its health and productivity.
          </p>
          <Link to="/animals/add" className="btn btn-primary">
            Add Your First Animal
          </Link>
        </div>
      ) : (
        <div className="animal-grid">
          {filtered.map(animal => {
            const animalStats = getAnimalStats(animal);
            return (
              <Link 
                key={animal.id} 
                to={`/animal/${animal.id}`}
                className="animal-card"
              >
                <div className="animal-card-header">
                  <div className="animal-avatar">
                    {getAnimalEmoji(animal.type)}
                  </div>
                  <div className="animal-info">
                    <div className="animal-name">{animal.name}</div>
                    <div className="animal-meta">
                      {animal.tagNumber && `#${animal.tagNumber} • `}
                      {animal.type.charAt(0).toUpperCase() + animal.type.slice(1)}
                    </div>
                  </div>
                  <span className={`badge ${animal.synced ? 'badge-success' : 'badge-warning'}`}>
                    {animal.synced ? 'Synced' : 'Pending'}
                  </span>
                </div>
                <div className="animal-stats">
                  <div className="animal-stat">
                    <div className="animal-stat-value">{animal.age || '-'}</div>
                    <div className="animal-stat-label">Years</div>
                  </div>
                  <div className="animal-stat">
                    <div className="animal-stat-value">{animalStats.milk}L</div>
                    <div className="animal-stat-label">Today</div>
                  </div>
                  <div className="animal-stat">
                    <div className="animal-stat-value">{animalStats.reports}</div>
                    <div className="animal-stat-label">Reports</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Mobile FAB */}
      <Link to="/animals/add" className="fab">+</Link>
    </div>
  );
}
