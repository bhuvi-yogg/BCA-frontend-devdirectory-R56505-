export default function SkeletonLoader({ count = 6, variant = 'card' }) {
  return (
    <div className={variant === 'card' ? 'grid' : 'stack'} aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => <div key={i} className={`skeleton skeleton-${variant}`} />)}
    </div>
  );
}
