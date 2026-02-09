import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db, getTodayDate } from "../db/database";
import MilkChart from "../components/MilkChart";
import { SkeletonCard } from "../components/Loader";

interface Stats {
  total: number;
  milk: number;
  reports: number;
  pending: { id: number; name: string; type: string }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const animals = await db.animals.toArray();
      const today = getTodayDate();
      const todayReports = await db.dailyReports
        .where("date")
        .equals(today)
        .toArray();
      const reportedIds = new Set(todayReports.map((r) => r.animalId));
      const pending = animals.filter((a) => !reportedIds.has(a.id!));

      setStats({
        total: animals.length,
        milk: todayReports.reduce((sum, r) => sum + (r.milk || 0), 0),
        reports: todayReports.length,
        pending: pending.map((a) => ({
          id: a.id!,
          name: a.name,
          type: a.type,
        })),
      });
    } catch (err) {
      console.error("Load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="stats">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div>
      {/* Stats */}
      <div className="stats">
        <div className="stat">
          <div className="stat-num">{stats?.total || 0}</div>
          <div className="stat-name">Total Animals</div>
        </div>
        <div className="stat">
          <div className="stat-num">
            {stats?.milk || 0}
            <span
              style={{
                fontSize: "1rem",
                fontWeight: 500,
                color: "var(--text-tertiary)",
                marginLeft: 2,
              }}
            >
              L
            </span>
          </div>
          <div className="stat-name">Milk Today</div>
        </div>
        <div className="stat">
          <div className="stat-num">{stats?.reports || 0}</div>
          <div className="stat-name">Reports Filed</div>
        </div>
        <div className="stat">
          <div className="stat-num">{stats?.pending.length || 0}</div>
          <div className="stat-name">Pending</div>
        </div>
      </div>

      <div className="two-col">
        <div>
          {/* Chart */}
          <div className="chart-wrap">
            <div className="chart-head">Milk Production (14 days)</div>
            <MilkChart />
          </div>

          {/* Actions */}
          <div className="card">
            <div className="card-head">
              <span className="card-title">Quick Actions</span>
            </div>
            <div className="card-body flex gap-3">
              <Link to="/report" className="btn btn-sage">
                New Report
              </Link>
              <Link to="/animals/add" className="btn btn-brown">
                Add Animal
              </Link>
              <Link to="/animals" className="btn btn-outline">
                View All
              </Link>
            </div>
          </div>
        </div>

        <div>
          {/* Pending */}
          <div className="card">
            <div className="card-head">
              <span className="card-title">Pending Reports</span>
              {stats?.pending.length ? (
                <span className="tag tag-terra">{stats.pending.length}</span>
              ) : null}
            </div>
            <div className="card-body">
              {!stats?.pending.length ? (
                <div className="text-center text-muted">All done!</div>
              ) : (
                <div className="animal-list">
                  {stats.pending.slice(0, 4).map((a) => (
                    <Link
                      key={a.id}
                      to={`/report?animal=${a.id}`}
                      className="animal-row"
                    >
                      <div className="avatar">
                        {a.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="animal-info">
                        <div className="animal-name">{a.name}</div>
                        <div className="animal-type">{a.type}</div>
                      </div>
                      <span className="tag tag-sage">Add</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
