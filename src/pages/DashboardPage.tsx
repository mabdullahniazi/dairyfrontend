import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db, getTodayDate } from "../db/database";
import MilkChart from "../components/MilkChart";
import { SkeletonCard } from "../components/Loader";
import {
  syncAll,
  isOnline,
  pullAnimals,
  pullReports,
} from "../services/syncService";

interface Stats {
  total: number;
  milk: number;
  reports: number;
  pending: { id: number; name: string; type: string }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [notifScheduled, setNotifScheduled] = useState(false);

  useEffect(() => {
    // Pull from server first, then load local data
    const init = async () => {
      if (isOnline()) {
        console.log("[Dashboard] Pulling data from server...");
        await pullAnimals();
        await pullReports();
      }
      await load();
    };
    init();
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

  // Manual sync button handler
  const handleSync = async () => {
    if (!isOnline()) {
      setSyncResult("⚠️ Offline - cannot sync");
      setTimeout(() => setSyncResult(null), 3000);
      return;
    }

    setSyncing(true);
    setSyncResult(null);

    try {
      const result = await syncAll();
      const pulled = result.pulled.animals + result.pulled.reports;
      const pushed = result.pushed.animals + result.pushed.reports;

      if (pulled === 0 && pushed === 0) {
        setSyncResult("✓ Already in sync");
      } else {
        setSyncResult(`✓ Synced: ↓${pulled} ↑${pushed}`);
      }

      // Reload data after sync
      await load();
    } catch (err) {
      console.error("Sync failed:", err);
      setSyncResult("✗ Sync failed");
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncResult(null), 4000);
    }
  };

  // Notification debug button - sends notification after 20 seconds
  const handleNotificationDebug = async () => {
    // Check permission
    if (!("Notification" in window)) {
      alert("Notifications not supported in this browser");
      return;
    }

    if (Notification.permission === "denied") {
      alert("Notifications are blocked. Please enable in browser settings.");
      return;
    }

    if (Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("Notification permission denied");
        return;
      }
    }

    // Schedule notification in 20 seconds
    setNotifScheduled(true);
    console.log("[Debug] Notification scheduled for 20 seconds from now");

    setTimeout(() => {
      new Notification("🔔 Livestock Manager", {
        body: "Debug notification - this fired after 20 seconds!",
        icon: "/icons/icon-192.png",
        tag: "debug-notification",
      });
      setNotifScheduled(false);
      console.log("[Debug] Notification sent!");
    }, 20000);
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
      {/* Sync Status Banner */}
      {syncResult && (
        <div
          className={`alert ${syncResult.includes("✓") ? "alert-success" : "alert-error"}`}
        >
          {syncResult}
        </div>
      )}

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
            <div className="card-body flex gap-3" style={{ flexWrap: "wrap" }}>
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

          {/* Sync & Debug Card */}
          <div className="card">
            <div className="card-head">
              <span className="card-title">Sync & Debug</span>
            </div>
            <div className="card-body flex gap-3" style={{ flexWrap: "wrap" }}>
              <button
                className="btn btn-terra"
                onClick={handleSync}
                disabled={syncing}
              >
                {syncing ? "Syncing..." : "Sync Now"}
              </button>
              <button
                className="btn btn-outline"
                onClick={handleNotificationDebug}
                disabled={notifScheduled}
              >
                {notifScheduled ? "Notif in 20s..." : "Test Notification"}
              </button>
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
