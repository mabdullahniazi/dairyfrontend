export default function Loader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="loader">
      <div className="spinner" />
      {text && <span className="text-muted" style={{ marginLeft: 12 }}>{text}</span>}
    </div>
  );
}

export function SkeletonCard() {
  return <div className="skeleton" style={{ height: 80, borderRadius: 16 }} />;
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 56, borderRadius: 10 }} />
      ))}
    </div>
  );
}
