import type { ReactNode } from "react";

type ModalProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  onClose: () => void;
};

export function Modal({ open, title, children, actions, onClose }: ModalProps) {
  if (!open) return null;

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalCard" onClick={(e) => e.stopPropagation()} dir="rtl">
        <div className="modalHead">
          <h3>{title}</h3>
          <button className="ghostIconButton" onClick={onClose} aria-label="إغلاق">
            ×
          </button>
        </div>
        <div className="modalBody">{children}</div>
        {actions && <div className="modalActions">{actions}</div>}
      </div>
    </div>
  );
}
