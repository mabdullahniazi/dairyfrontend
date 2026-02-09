export default function Loader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="loader">
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" />
        <p className="text-muted mt-md" style={{ fontSize: '0.875rem' }}>{text}</p>
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="animal-item">
      <div className="skeleton skeleton-avatar" />
      <div className="animal-info" style={{ flex: 1 }}>
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-text" style={{ width: '40%' }} />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="animal-list">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
