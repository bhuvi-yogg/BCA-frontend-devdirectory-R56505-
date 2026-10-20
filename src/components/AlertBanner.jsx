export default function AlertBanner({ type = 'error', message, onRetry, onDismiss }) {
  if (!message) return null;
  return (
    <div className={`alert alert-${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <span>{message}</span>
      <span className="alert-actions">
        {onRetry && <button className="btn btn-sm" onClick={onRetry}>Retry</button>}
        {onDismiss && <button className="btn btn-sm btn-ghost" onClick={onDismiss} aria-label="Dismiss">✕</button>}
      </span>
    </div>
  );
}
