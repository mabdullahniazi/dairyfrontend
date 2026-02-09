import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db, getAnimalEmoji, type Animal, type DailyReport } from '../db/database';
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
        // Load recent reports for this animal
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
    const confirmed = window.confirm(`Are you sure you want to delete ${animal.name}? This cannot be undone.`);
    if (!confirmed) return;

    setDeleting(true);
    try {
      // Delete animal and all its reports
      await db.dailyReports.where('animalId').equals(animal.id).delete();
      await db.animals.delete(animal.id);
      navigate('/animals', { replace: true });
    } catch (err) {
      console.error('Failed to delete animal:', err);
      alert('Failed to delete animal. Please try again.');
      setDeleting(false);
    }
  };

  if (loading) {
    return <Loader text="Loading animal..." />;
  }

  if (!animal) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🔍</div>
        <h3 className="empty-title">Animal Not Found</h3>
        <p className="empty-text">This animal may have been deleted.</p>
        <Link to="/animals" className="btn btn-primary">Back to Animals</Link>
      </div>
    );
  }

  // Calculate stats
  const totalMilk = reports.reduce((sum, r) => sum + (r.milk || 0), 0);
  const avgMilk = reports.length > 0 ? (totalMilk / reports.length).toFixed(1) : 0;

  return (
    <div>
      {/* Animal Header */}
      <div className="card mb-lg" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '8px' }}>
          {getAnimalEmoji(animal.type)}
        </div>
        <h1 style={{ marginBottom: '4px' }}>{animal.name}</h1>
        {animal.tagNumber && (
          <p className="text-muted" style={{ marginBottom: '8px' }}>Tag: #{animal.tagNumber}</p>
        )}
        <div className="flex justify-between gap-md" style={{ marginTop: '16px' }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{animal.age}</div>
            <div className="text-muted" style={{ fontSize: '0.75rem' }}>Years Old</div>
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
          <div className="alert alert-warning mt-md">
            ⏳ This animal has not been synced to the server yet.
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-sm mb-lg">
        <Link to={`/report/add?animalId=${animal.id}`} className="btn btn-primary" style={{ flex: 1 }}>
          + Add Report
        </Link>
        <Link to={`/animals/edit/${animal.id}`} className="btn btn-outline" style={{ flex: 1 }}>
          ✏️ Edit
        </Link>
      </div>

      {/* Custom Attributes */}
      {Object.keys(animal.attributes || {}).length > 0 && (
        <div className="card mb-lg">
          <h3 className="section-title mb-md">📋 Details</h3>
          {Object.entries(animal.attributes).map(([key, value]) => (
            <div key={key} className="flex justify-between" style={{ marginBottom: '8px' }}>
              <span className="text-muted" style={{ textTransform: 'capitalize' }}>{key}</span>
              <span style={{ fontWeight: 500 }}>{String(value)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Recent Reports */}
      {reports.length > 0 && (
        <div className="mb-lg">
          <h3 className="section-title mb-md">📊 Recent Reports</h3>
          {reports.slice(0, 5).map(report => (
            <div key={report.id} className="report-item">
              <div className="report-icon">📅</div>
              <div className="report-info">
                <div className="report-value">{report.date}</div>
                <div className="report-label">
                  🥛 {report.milk}L • 🌾 {report.feed}kg
                  {report.notes && ` • "${report.notes}"`}
                </div>
              </div>
              {!report.synced && <span className="badge badge-pending">Pending</span>}
            </div>
          ))}
        </div>
      )}

      {/* Delete Button */}
      <button
        className="btn btn-danger btn-block"
        onClick={handleDelete}
        disabled={deleting}
        style={{ marginTop: 'auto' }}
      >
        {deleting ? 'Deleting...' : '🗑️ Delete Animal'}
      </button>
    </div>
  );
}
