import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, getAnimalEmoji, getTodayDate, type Animal, type DailyReport } from '../db/database';
import { SkeletonList } from '../components/Loader';
import MilkChart from '../components/MilkChart';

export default function DashboardPage() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [todayReports, setTodayReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const allAnimals = await db.animals.toArray();
      const today = getTodayDate();
      const reports = await db.dailyReports.where('date').equals(today).toArray();
      
      setAnimals(allAnimals);
      setTodayReports(reports);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalMilk = todayReports.reduce((sum, r) => sum + (r.milk || 0), 0);
  const animalsWithReport = new Set(todayReports.map(r => r.animalId));
  const animalsWithoutReport = animals.filter(a => !animalsWithReport.has(a.id!));
  
  // Count milk-producing animals (cows and buffalos)
  const milkAnimals = animals.filter(a => a.type === 'cow' || a.type === 'buffalo');

  if (loading) {
    return (
      <div>
        <div className="stat-grid">
          <div className="stat-card"><div className="skeleton" style={{height: 80}} /></div>
          <div className="stat-card"><div className="skeleton" style={{height: 80}} /></div>
        </div>
        <SkeletonList count={2} />
      </div>
    );
  }

  return (
    <div>
      {/* Stats Grid */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon">🐄</div>
          <div className="stat-value">{animals.length}</div>
          <div className="stat-label">Total Animals</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🥛</div>
          <div className="stat-value">{totalMilk}L</div>
          <div className="stat-label">Today's Milk</div>
        </div>
      </div>

      {/* Quick Actions */}
      {animalsWithoutReport.length > 0 && (
        <Link to="/report/add" className="btn btn-primary btn-block mb-lg">
          📝 Add Today's Report ({animalsWithoutReport.length} pending)
        </Link>
      )}

      {animals.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🐄</div>
          <h3 className="empty-title">No Animals Yet</h3>
          <p className="empty-text">Start by adding your first animal to the farm.</p>
          <Link to="/animals/add" className="btn btn-primary">
            + Add Animal
          </Link>
        </div>
      )}

      {/* Monthly Chart */}
      {milkAnimals.length > 0 && (
        <div className="chart-container">
          <h3 className="chart-title">📈 Monthly Milk Production</h3>
          <MilkChart />
        </div>
      )}

      {/* Animals Missing Report */}
      {animalsWithoutReport.length > 0 && (
        <div className="mb-lg">
          <div className="section-header">
            <h3 className="section-title">⏳ Pending Reports</h3>
            <span className="badge badge-warning">{animalsWithoutReport.length}</span>
          </div>
          <div className="animal-list">
            {animalsWithoutReport.slice(0, 3).map(animal => (
              <Link
                key={animal.id}
                to={`/report/add?animalId=${animal.id}`}
                className="animal-item"
              >
                <div className="animal-avatar">{getAnimalEmoji(animal.type)}</div>
                <div className="animal-info">
                  <div className="animal-name">{animal.name}</div>
                  <div className="animal-meta">Tap to add report</div>
                </div>
                <span className="animal-arrow">→</span>
              </Link>
            ))}
          </div>
          {animalsWithoutReport.length > 3 && (
            <p className="text-center text-muted mt-md" style={{ fontSize: '0.875rem' }}>
              +{animalsWithoutReport.length - 3} more animals need reports
            </p>
          )}
        </div>
      )}

      {/* Today's Reports */}
      {todayReports.length > 0 && (
        <div>
          <div className="section-header">
            <h3 className="section-title">✅ Today's Reports</h3>
            <span className="badge badge-success">{todayReports.length}</span>
          </div>
          <div className="animal-list">
            {todayReports.map(report => {
              const animal = animals.find(a => a.id === report.animalId);
              return (
                <div key={report.id} className="animal-item">
                  <div className="animal-avatar">{animal ? getAnimalEmoji(animal.type) : '🐄'}</div>
                  <div className="animal-info">
                    <div className="animal-name">{animal?.name || 'Unknown'}</div>
                    <div className="animal-meta">
                      🥛 {report.milk}L • 🌾 {report.feed}kg
                    </div>
                  </div>
                  {!report.synced && <span className="badge badge-pending">Pending sync</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
