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
    loadAnimal();
  }, [id]);

  const loadAnimal = async () => {
    if (!id) return;
    try {
      const found = await db.animals.get(Number(id));
      if (found) {
        setAnimal(found);
        const animalReports = await db.dailyReports
          .where('animalId')
          .equals(found.id!)
          .reverse()
          .limit(10)
          .toArray();
        setReports(animalReports);
      }
    } catch (err) {
      console.error('Failed to load animal:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!animal?.id) return;
    const confirmed = window.confirm(`Are you sure you want to delete ${animal.name}?`);
    if (!confirmed) return;

    setDeleting(true);
    try {
      await db.dailyReports.where('animalId').equals(animal.id).delete();
      await db.animals.delete(animal.id);
      navigate('/animals', { replace: true });
    } catch (err) {
      console.error('Failed to delete animal:', err);
      alert('Failed to delete animal.');
      setDeleting(false);
    }
  };

  if (loading) {
    return <Loader text="Loading..." />;
  }

  if (!animal) {
    return (
      <div className="empty-state">
        <div className="empty-icon"></div>
        <h3 className="empty-title">Animal Not Found</h3>
        <p className="empty-text">This animal may have been deleted.</p>
        <Link to="/animals" className="btn btn-primary">Back to Animals</Link>
      </div>
    );
  }

  const totalMilk = reports.reduce((sum, r) => sum + (r.milk || 0), 0);
  const avgMilk = reports.length > 0 ? (totalMilk / reports.length).toFixed(1) : 0;

  return (
    <div>
      {/* Header */}
      <div className="card mb-lg" style={{ textAlign: 'center', padding: '24px' }}>
        <div className="animal-avatar" style={{ width: 72, height: 72, fontSize: '1.5rem', margin: '0 auto 12px' }}>
          {animal.name.slice(0, 2).toUpperCase()}
        </div>
        <h1 style={{ marginBottom: '4px' }}>{animal.name}</h1>
        {animal.tagNumber && (
          <p className="text-muted" style={{ marginBottom: '8px' }}>Tag: #{animal.tagNumber}</p>
        )}
        <p className="text-muted" style={{ textTransform: 'capitalize' }}>{animal.type}</p>
        
        <div className="flex justify-between gap-md" style={{ marginTop: '20px' }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{animal.age}</div>
            <div className="text-muted" style={{ fontSize: '0.75rem' }}>Years</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{reports.length}</div>
            <div className="text-muted" style={{ fontSize: '0.75rem' }}>Reports</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{avgMilk}L</div>
            <div className="text-muted" style={{ fontSize: '0.75rem' }}>Avg Milk</div>
          </div>
        </div>
        
        {!animal.synced && (
          <div className="alert alert-warning mt-md">Not synced yet</div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-sm mb-lg">
        <Link to={`/report?animal=${animal.id}`} className="btn btn-primary" style={{ flex: 1 }}>
          Add Report
        </Link>
        <Link to={`/animals/edit/${animal.id}`} className="btn btn-outline" style={{ flex: 1 }}>
          Edit
        </Link>
      </div>

      {/* Attributes */}
      {Object.keys(animal.attributes || {}).length > 0 && (
        <div className="card mb-lg">
          <div className="card-header">
            <span className="section-title">Details</span>
          </div>
          <div className="card-body">
            {Object.entries(animal.attributes).map(([key, value]) => (
              <div key={key} className="flex justify-between" style={{ marginBottom: '8px' }}>
                <span className="text-muted" style={{ textTransform: 'capitalize' }}>{key}</span>
                <span style={{ fontWeight: 500 }}>{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reports */}
      {reports.length > 0 && (
        <div className="mb-lg">
          <h3 className="section-title mb-md">Recent Reports</h3>
          {reports.slice(0, 5).map(report => (
            <div key={report.id} className="report-item">
              <div className="report-icon">{report.date.slice(8, 10)}</div>
              <div className="report-info">
                <div className="report-value">{report.date}</div>
                <div className="report-label">
                  Milk: {report.milk}L · Feed: {report.feed}kg
                  {report.notes && ` · "${report.notes}"`}
                </div>
              </div>
              {!report.synced && <span className="badge badge-pending">Pending</span>}
            </div>
          ))}
        </div>
      )}

      {/* Delete */}
      <button
        className="btn btn-danger btn-block"
        onClick={handleDelete}
        disabled={deleting}
      >
        {deleting ? 'Deleting...' : 'Delete Animal'}
      </button>
    </div>
  );
}
