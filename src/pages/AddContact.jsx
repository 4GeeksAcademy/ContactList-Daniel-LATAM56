import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "../storeContacts.jsx";

const emptyForm = { full_name: "", email: "", phone: "", address: "" };

function AddContact() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, actions, agenda } = useApp();
  const editing = useMemo(() => Boolean(id), [id]);
  const [form, setForm] = useState(emptyForm);
  const [localErr, setLocalErr] = useState("");

  useEffect(() => {
    if (editing) {
      const found =
        state.contacts.find((c) => String(c.id) === String(id)) ||
        state.selected;
      if (found)
        setForm({
          full_name: found.full_name ?? "",
          email: found.email ?? "",
          phone: found.phone ?? "",
          address: found.address ?? "",
        });
    } else {
      setForm(emptyForm);
      actions.setSelected(null);
    }
  }, [editing, id, state.contacts]);

  const onChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.full_name.trim()) return "El nombre es obligatorio.";
    if (!form.email.trim()) return "El email es obligatorio.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "El email no es válido.";
    if (!form.phone.trim()) return "El teléfono es obligatorio.";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLocalErr("");

    const msg = validate();
    if (msg) {
      setLocalErr(msg);
      return;
    }

    try {
      if (editing) {
        await actions.updateContact(id, form);
      } else {
        await actions.addContact(form);
      }
    } catch (err) {
      console.error("Error en onSubmit:", err);
      setLocalErr(err.message || "No se pudo crear el contacto.");
    }
  };

  return (
    <div className="container py-4">
      <button className="btn btn-link px-0 mb-3" onClick={() => navigate(-1)}>
        ← Volver
      </button>

      <h2>{editing ? "Editar contacto" : "Nuevo contacto"}</h2>
      <p className="text-muted mb-3">
        Agenda: <code>{agenda}</code>
      </p>

      {(localErr || state.error) && (
        <div className="alert alert-danger">{localErr || state.error}</div>
      )}

      <form className="row g-3" onSubmit={onSubmit} noValidate>
        <div className="col-md-6">
          <label className="form-label">Nombre completo</label>
          <input
            name="full_name"
            className="form-control"
            value={form.full_name}
            onChange={onChange}
            placeholder="Juan Pérez"
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Email</label>
          <input
            name="email"
            type="email"
            className="form-control"
            value={form.email}
            onChange={onChange}
            placeholder="correo@ejemplo.com"
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Teléfono</label>
          <input
            name="phone"
            className="form-control"
            value={form.phone}
            onChange={onChange}
            placeholder="7868491438"
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Dirección</label>
          <input
            name="address"
            className="form-control"
            value={form.address}
            onChange={onChange}
            placeholder="10023 Belle Rive Blvd APT 1607"
          />
        </div>

        <div className="col-12 d-flex gap-2">
          <button
            type="submit"
            className="btn btn-success"
            disabled={state.loading}
          >
            {state.loading
              ? "Guardando..."
              : editing
              ? "Guardar cambios"
              : "Crear"}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/contacts")}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddContact; // 👈 ESTA LÍNEA ES CLAVE
