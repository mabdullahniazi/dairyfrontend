import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, type Animal } from '../db/database';
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

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div><h2>Animals</h2></div>
        </div>
        <SkeletonList count={4} />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="text-muted" style={{ marginTop: '4px' }}>
            {animals.length} animal{animals.length !== 1 ? 's' : ''} registered
          </p>
        </div>
        <Link to="/animals/add" className="btn btn-primary">Add Animal</Link>
      </div>

      {types.length > 1 && (
        <div className="filter-tabs">
          {types.map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`filter-tab ${filter === type ? 'active' : ''}`}
            >
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"></div>
          <h3 className="empty-title">No animals yet</h3>
          <p className="empty-text">Add your first animal to get started.</p>
          <Link to="/animals/add" className="btn btn-primary">Add Animal</Link>
        </div>
      ) : (
        <div className="animal-grid">
          {filtered.map(animal => (
            <Link 
              key={animal.id} 
              to={`/animal/${animal.id}`}
              className="animal-card"
            >
              <div className="animal-card-header">
                <div className="animal-avatar">
                  {animal.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="animal-info">
                  <div className="animal-name">{animal.name}</div>
                  <div className="animal-meta">
                    {animal.tagNumber && `#${animal.tagNumber} · `}
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
                  <div className="animal-stat-value">-</div>
                  <div className="animal-stat-label">Today</div>
                </div>
                <div className="animal-stat">
                  <div className="animal-stat-value">-</div>
                  <div className="animal-stat-label">Reports</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Link to="/animals/add" className="fab">+</Link>
    </div>
  );
}
