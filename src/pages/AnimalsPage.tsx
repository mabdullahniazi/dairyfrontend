import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db, type Animal } from "../db/database";
import { SkeletonList } from "../components/Loader";
import { isOnline, pullAnimals } from "../services/syncService";

export default function AnimalsPage() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const init = async () => {
      // Pull from server first if online
      if (isOnline()) {
        console.log("[Animals] Pulling animals from server...");
        await pullAnimals();
      }
      await load();
    };
    init();
  }, []);

  const load = async () => {
    try {
      const all = await db.animals.toArray();
      setAnimals(all);
    } catch (err) {
      console.error("Load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered =
    filter === "all" ? animals : animals.filter((a) => a.type === filter);
  const types = ["all", ...new Set(animals.map((a) => a.type))];

  if (loading) {
    return <SkeletonList count={4} />;
  }

  return (
    <div>
      {/* Header */}
      <div
        className="flex gap-4 mb-6"
        style={{ justifyContent: "space-between", alignItems: "center" }}
      >
        <p className="text-muted">{animals.length} animals</p>
        <Link to="/animals/add" className="btn btn-sage">
          Add Animal
        </Link>
      </div>

      {/* Filters */}
      {types.length > 1 && (
        <div className="filters">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`filter-btn ${filter === t ? "active" : ""}`}
            >
              {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="empty">
          <div className="empty-circle"></div>
          <div className="empty-title">No animals yet</div>
          <p className="empty-text">Add your first animal to get started.</p>
          <Link to="/animals/add" className="btn btn-sage">
            Add Animal
          </Link>
        </div>
      ) : (
        <div className="animal-grid">
          {filtered.map((a) => (
            <Link key={a.id} to={`/animals/${a.id}`} className="animal-card">
              <div className="avatar">{a.name.slice(0, 2).toUpperCase()}</div>
              <div className="animal-name">{a.name}</div>
              <div className="animal-type">
                {a.tagNumber && `#${a.tagNumber} · `}
                {a.type}
              </div>
              <div className="animal-card-stats">
                <div className="animal-card-stat">
                  <div className="animal-card-stat-val">{a.age || "-"}</div>
                  <div className="animal-card-stat-lbl">Years</div>
                </div>
                <div className="animal-card-stat">
                  <div className="animal-card-stat-val">-</div>
                  <div className="animal-card-stat-lbl">Milk</div>
                </div>
                <div className="animal-card-stat">
                  <div className="animal-card-stat-val">
                    {a.synced ? "Yes" : "No"}
                  </div>
                  <div className="animal-card-stat-lbl">Synced</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Link to="/animals/add" className="fab">
        +
      </Link>
    </div>
  );
}
