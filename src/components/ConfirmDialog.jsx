import { useEffect, useRef } from 'react';
export default function ConfirmDialog({ open, message, onConfirm, onCancel }) {
  const ref = useRef(null);
  useEffect(() => { const d = ref.current; if (!d) return; if (open && !d.open) d.showModal(); if (!open && d.open) d.close(); }, [open]);
  return (
    <dialog ref={ref} className="glass dialog" onCancel={onCancel}>
      <p>{message}</p>
      <div className="row"><button className="btn btn-ghost" onClick={onCancel}>Cancel</button><button className="btn btn-danger" onClick={onConfirm}>Confirm</button></div>
    </dialog>
  );
}
