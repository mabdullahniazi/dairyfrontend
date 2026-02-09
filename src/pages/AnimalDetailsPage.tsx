import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db, type Animal, type DailyReport } from '../db/database';
import Loader from '../components/Loader';

export default function AnimalDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    load();
  }, [id]);

  const load = async () => {
    if (!id) return;
    try {
      const found = await db.animals.get(Number(id));
      if (found) {
        setAnimal(found);
        const r = await db.dailyReports.where('animalId').equals(found.id!).reverse().limit(10).toArray();
        setReports(r);
      }
    } catch (err) {
      console.error('Load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!animal?.id || !window.confirm(`Delete ${animal.name}?`)) return;
    setDeleting(true);
    try {
      await db.dailyReports.where('animalId').equals(animal.id).delete();
      await db.animals.delete(animal.id);
      navigate('/animals', { replace: true });
    } catch (err) {
      console.error('Delete failed:', err);
      setDeleting(false);
    }
  };

  if (loading) return <Loader text="Loading..." />;

  if (!animal) {
    return (
      <div className="empty">
        <div className="empty-circle"></div>
        <div className="empty-title">Not Found</div>
        <p className="empty-text">This animal may have been deleted.</p>
        <Link to="/animals" className="btn btn-sage">Back</Link>
      </div>
    );
  }

  const totalMilk = reports.reduce((sum, r) => sum + (r.milk || 0), 0);
  const avgMilk = reports.length > 0 ? (totalMilk / reports.length).toFixed(1) : 0;

  return (
    <div>
      {/* Header Card */}
      <div className="card mb-4 text-center" style={{ padding: '24px' }}>
        <div className="avatar" style={{ width: 64, height: 64, fontSize: '1.3rem', margin: '0 auto 12px' }}>
          {animal.name.slice(0, 2).toUpperCase()}
        </div>
        <h2 style={{ marginBottom: 4 }}>{animal.name}</h2>
        {animal.tagNumber && <p className="text-muted" style={{ marginBottom: 4 }}>Tag: #{animal.tagNumber}</p>}
        <p className="text-muted" style={{ textTransform: 'capitalize' }}>{animal.type}</p>

        <div className="flex gap-4 mt-4" style={{ justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{animal.age}</div>
            <div className="text-muted" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Years</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{reports.length}</div>
            <div className="text-muted" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Reports</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{avgMilk}L</div>
            <div className="text-muted" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Avg Milk</div>
          </div>
        </div>

        {!animal.synced && <div className="alert alert-error mt-4">Not synced</div>}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-4">
        <Link to={`/report?animal=${animal.id}`} className="btn btn-sage" style={{ flex: 1 }}>Add Report</Link>
        <Link to={`/animals/edit/${animal.id}`} className="btn btn-outline" style={{ flex: 1 }}>Edit</Link>
      </div>

      {/* Attributes */}
      {Object.keys(animal.attributes || {}).length > 0 && (
        <div className="card mb-4">
          <div className="card-head"><span className="card-title">Details</span></div>
          <div className="card-body">
            {Object.entries(animal.attributes).map(([k, v]) => (
              <div key={k} className="flex gap-4" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="text-muted" style={{ textTransform: 'capitalize' }}>{k}</span>
                <span style={{ fontWeight: 500 }}>{String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reports */}
      {reports.length > 0 && (
        <div className="mb-4">
          <h3 className="mb-4">Recent Reports</h3>
          {reports.slice(0, 5).map(r => (
            <div key={r.id} className="report-row">
              <div className="report-date">{r.date.slice(8, 10)}</div>
              <div className="report-info">
                <div className="report-val">{r.date}</div>
                <div className="report-lbl">Milk: {r.milk}L · Feed: {r.feed}kg</div>
              </div>
              {!r.synced && <span className="tag tag-terra">Pending</span>}
            </div>
          ))}
        </div>
      )}

      {/* Delete */}
      <button className="btn btn-danger btn-block" onClick={handleDelete} disabled={deleting}>
        {deleting ? 'Deleting...' : 'Delete Animal'}
      </button>
    </div>
  );
}
