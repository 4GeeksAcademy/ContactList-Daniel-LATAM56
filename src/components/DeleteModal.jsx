// src/components/DeleteModal.jsx
import React, { useEffect } from "react";

export default function DeleteModal({ show, contact, onCancel, onConfirm }) {
  useEffect(() => {
    document.body.style.overflow = show ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [show]);

  if (!show) return null;

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100" style={{ background: "rgba(0,0,0,.5)", zIndex: 1050 }}>
      <div className="d-flex align-items-center justify-content-center h-100 p-3">
        <div className="bg-white rounded-3 shadow p-4" style={{ maxWidth: 420, width: "100%" }}>
          <h5 className="mb-2">¿Eliminar contacto?</h5>
          <p className="text-muted mb-4">
            Vas a eliminar <strong>{contact?.full_name}</strong>. Esta acción no se puede deshacer.
          </p>
          <div className="d-flex justify-content-end gap-2">
            <button className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
            <button className="btn btn-danger" onClick={onConfirm}>Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
