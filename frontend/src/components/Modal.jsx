import { useEffect } from 'react';

export default function Modal({ id, title, subtitle, open, onClose, children, footer }) {
  useEffect(() => {
    const el = document.getElementById(`overlay-${id}`);
    if (!el) return;
    el.classList.toggle('open', open);
  }, [open, id]);

  const handleOverlay = e => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="overlay" id={`overlay-${id}`} onClick={handleOverlay}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-header">
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        <div className="modal-body">
          {children}
        </div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
