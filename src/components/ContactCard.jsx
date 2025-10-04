import React from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../storeContacts.jsx";

export default function ContactCard({ contact, onAskDelete }) {
  const navigate = useNavigate();
  const { actions } = useApp();

  // nombre a mostrar (fallback)
  const displayName = contact.full_name || contact.name || "(Sin nombre)";

  // genera iniciales
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join("");

  const onEdit = () => {
    actions.setSelected(contact);
    navigate(`/contacts/${contact.id}`);
  };

  return (
    <div className="card h-100 shadow-sm">
      <div className="card-body">
        <div className="d-flex align-items-start justify-content-between">
          <div>
            <h5 className="card-title mb-1 fw-bold">{displayName}</h5>
            <p className="text-muted mb-2">{contact.email}</p>
          </div>

          {/* Avatar con iniciales */}
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              backgroundColor: "#0d6efd20", // color suave
              color: "#0d6efd",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "600",
              fontSize: "1.1rem",
              textTransform: "uppercase",
            }}
          >
            {initials || "?"}
          </div>
        </div>

        <ul className="list-unstyled small mb-3">
          <li><strong>Tel:</strong> {contact.phone || "—"}</li>
          <li><strong>Dir:</strong> {contact.address || "—"}</li>
        </ul>

        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary btn-sm" onClick={onEdit}>
            Editar
          </button>
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={() => onAskDelete(contact)}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
