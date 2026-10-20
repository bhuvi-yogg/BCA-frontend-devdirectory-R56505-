export default function EmptyState({ title, hint, action }) {
  return <div className="empty glass"><h3>{title}</h3>{hint && <p className="muted">{hint}</p>}{action}</div>;
}
