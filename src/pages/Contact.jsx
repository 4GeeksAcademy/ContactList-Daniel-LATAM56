// src/pages/Contact.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../storeContacts.jsx";
import ContactCard from "../components/ContactCard.jsx";
import DeleteModal from "../components/DeleteModal.jsx";

export default function Contact() {
  const { state, actions } = useApp();
  const [toDelete, setToDelete] = useState(null);

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="m-0">Contactos ({state.contacts.length})</h2>
        <Link to="/contacts/new" className="btn btn-primary">+ Nuevo</Link>
      </div>

      {state.loading && <p className="text-muted">Cargando…</p>}
      {state.error && <p className="text-danger">Error: {state.error}</p>}

      {state.contacts.length === 0 && !state.loading ? (
        <div className="alert alert-info">No hay contactos todavía.</div>
      ) : (
        <div className="row g-3">
          {state.contacts.map(c => (
            <div className="col-12 col-md-6 col-lg-4" key={c.id}>
              <ContactCard
                contact={c}
                onAskDelete={() => setToDelete(c)}
              />
            </div>
          ))}
        </div>
      )}

      <DeleteModal
        show={!!toDelete}
        contact={toDelete}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          await actions.deleteContact(toDelete.id);
          setToDelete(null);
        }}
      />
    </div>
  );
}
