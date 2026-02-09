import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, getAnimalEmoji, getTodayDate } from '../db/database';
import MilkChart from '../components/MilkChart';
import { SkeletonCard } from '../components/Loader';

interface DashboardStats {
  totalAnimals: number;
  todayMilk: number;
  todayReports: number;
  pendingAnimals: { id: number; name: string; type: string }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const animals = await db.animals.toArray();
      const today = getTodayDate();
      const todayReports = await db.dailyReports.where('date').equals(today).toArray();
      
      // Find animals without today's report
      const reportedIds = new Set(todayReports.map(r => r.animalId));
      const pending = animals.filter(a => !reportedIds.has(a.id!));

      setStats({
        totalAnimals: animals.length,
        todayMilk: todayReports.reduce((sum, r) => sum + (r.milk || 0), 0),
        todayReports: todayReports.length,
        pendingAnimals: pending.map(a => ({ id: a.id!, name: a.name, type: a.type })),
      });
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="stat-grid">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Grid */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <div className="stat-value">{stats?.totalAnimals || 0}</div>
              <div className="stat-label">Total Animals</div>
            </div>
            <div className="stat-icon blue">🐄</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <div className="stat-value">{stats?.todayMilk || 0}L</div>
              <div className="stat-label">Today's Milk</div>
            </div>
            <div className="stat-icon green">🥛</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <div className="stat-value">{stats?.todayReports || 0}</div>
              <div className="stat-label">Reports Today</div>
            </div>
            <div className="stat-icon purple">📝</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <div className="stat-value">{stats?.pendingAnimals.length || 0}</div>
              <div className="stat-label">Pending Reports</div>
            </div>
            <div className="stat-icon orange">⏳</div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="two-col-layout">
        {/* Main Content */}
        <div>
          {/* Milk Production Chart */}
          <div className="chart-container mb-lg">
            <h3 className="chart-title">Milk Production (Last 14 Days)</h3>
            <MilkChart />
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <span className="section-title">Quick Actions</span>
            </div>
            <div className="card-body" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link to="/report" className="btn btn-primary">
                📝 Add Report
              </Link>
              <Link to="/animals/add" className="btn btn-secondary">
                ➕ Add Animal
              </Link>
              <Link to="/animals" className="btn btn-outline">
                📋 View All Animals
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar Content */}
        <div>
          {/* Pending Reports */}
          <div className="card">
            <div className="card-header">
              <span className="section-title">Pending Reports</span>
              {stats?.pendingAnimals.length ? (
                <span className="badge badge-warning">
                  {stats.pendingAnimals.length} remaining
                </span>
              ) : null}
            </div>
            <div className="card-body">
              {!stats?.pendingAnimals.length ? (
                <div className="text-center text-muted" style={{ padding: '24px 0' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✅</div>
                  <p>All reports complete!</p>
                </div>
              ) : (
                <div className="animal-list">
                  {stats.pendingAnimals.slice(0, 5).map(animal => (
                    <Link 
                      key={animal.id}
                      to={`/report?animal=${animal.id}`}
                      className="animal-item"
                    >
                      <div className="animal-avatar" style={{ width: 40, height: 40, fontSize: '1.25rem' }}>
                        {getAnimalEmoji(animal.type)}
                      </div>
                      <div className="animal-info">
                        <div className="animal-name" style={{ fontSize: '0.9rem' }}>{animal.name}</div>
                        <div className="animal-meta">{animal.type}</div>
                      </div>
                      <span className="badge badge-pending">Add</span>
                    </Link>
                  ))}
                  {stats.pendingAnimals.length > 5 && (
                    <Link to="/report" className="btn btn-ghost btn-block mt-md">
                      View all {stats.pendingAnimals.length} pending
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
