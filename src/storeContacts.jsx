// src/storeContacts.jsx
import React, { createContext, useContext, useEffect, useReducer } from "react";
import { useNavigate } from "react-router-dom";

/** -----------------------------
 * CONFIG
 * ------------------------------*/
const AGENDA_SLUG = "daniel_latam56"; // cámbialo si te dieron otro
const API_BASE = "https://playground.4geeks.com/contact";

/** -----------------------------
 * CONTEXT + STATE
 * ------------------------------*/
const AppContext = createContext();

const initialState = {
  contacts: [],
  loading: false,
  error: null,
  selected: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "LOADING":
      return { ...state, loading: true, error: null };
    case "ERROR":
      return { ...state, loading: false, error: action.payload };
    case "SET_CONTACTS":
      return { ...state, loading: false, contacts: action.payload };
    case "SET_SELECTED":
      return { ...state, selected: action.payload || null };
    case "ADD_CONTACT":
      return { ...state, loading: false, contacts: [action.payload, ...state.contacts] };
    case "UPDATE_CONTACT":
      return {
        ...state,
        loading: false,
        contacts: state.contacts.map((c) => (c.id === action.payload.id ? action.payload : c)),
      };
    case "DELETE_CONTACT":
      return {
        ...state,
        loading: false,
        contacts: state.contacts.filter((c) => c.id !== action.payload),
      };
    default:
      return state;
  }
}

/** -----------------------------
 * HELPERS
 * ------------------------------*/
const endpoints = {
  listByAgenda: () => `${API_BASE}/agendas/${encodeURIComponent(AGENDA_SLUG)}/contacts`,
  createInAgenda: () => `${API_BASE}/agendas/${encodeURIComponent(AGENDA_SLUG)}/contacts`,
  contactById: (id) => `${API_BASE}/contacts/${id}`,
  createGeneric: () => `${API_BASE}/contacts`,
  createAgenda: () => `${API_BASE}/agendas/${encodeURIComponent(AGENDA_SLUG)}`,
  // suma esta línea dentro de "endpoints"
  contactInAgenda: (id) => `${API_BASE}/agendas/${encodeURIComponent(AGENDA_SLUG)}/contacts/${id}`,

};

const normalizeContact = (data) => {
  if (!data) return null;
  const maybe = data.contact || data.result || data;
  return {
    id: Number(maybe.id ?? maybe.contact_id ?? maybe.uid ?? maybe._id ?? 0),
    full_name: maybe.full_name ?? maybe.name ?? "",
    email: maybe.email ?? "",
    phone: maybe.phone ?? "",
    address: maybe.address ?? "",
  };
};

const readErrorText = async (res) => {
  try {
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const j = await res.json();
      return j?.msg || j?.message || j?.detail || JSON.stringify(j);
    }
    return await res.text();
  } catch {
    return `HTTP ${res.status}`;
  }
};

const ensureAgendaExists = async () => {
  try {
    // Normalmente 201/200 si la crea; 409/400 si ya existe (lo ignoramos)
    await fetch(endpoints.createAgenda(), { method: "POST" });
  } catch {
    // Silencioso: si falla, el GET siguiente nos dirá si realmente hay problema
  }
};

/** -----------------------------
 * PROVIDER
 * ------------------------------*/
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const navigate = useNavigate();

  const loadContacts = async () => {
    try {
      dispatch({ type: "LOADING" });
      await ensureAgendaExists();
      const res = await fetch(endpoints.listByAgenda());
      if (!res.ok) throw new Error(`Error al cargar contactos (${res.status})`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.contacts || [];
      dispatch({ type: "SET_CONTACTS", payload: list });
    } catch (err) {
      dispatch({ type: "ERROR", payload: err.message });
    }
  };

  const addContact = async (payload) => {
    try {
      dispatch({ type: "LOADING" });

      await ensureAgendaExists();

      const base = {
        full_name: String(payload.full_name || payload.name || "").trim(),
        name: String(payload.full_name || payload.name || "").trim(), // la API puede requerir "name"
        email: String(payload.email || "").trim(),
        phone: String(payload.phone || "").trim(),
        address: String(payload.address || "").trim(),
      };

      // Intento 1: POST /agendas/{slug}/contacts (requiere "name" en algunas versiones)
      let res = await fetch(endpoints.createInAgenda(), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: base.name,
          full_name: base.full_name,
          email: base.email,
          phone: base.phone,
          address: base.address,
        }),
      });

      // Fallback: POST /contacts con agenda_slug
      if (!res.ok) {
        const msg1 = await readErrorText(res);
        console.warn("POST /agendas/{slug}/contacts falló:", res.status, msg1);

        const body = {
          agenda_slug: AGENDA_SLUG,
          name: base.name,
          full_name: base.full_name,
          email: base.email,
          phone: base.phone,
          address: base.address,
        };
        res = await fetch(endpoints.createGeneric(), {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const errTxt = await readErrorText(res);
          throw new Error(`Error al crear contacto (${res.status}): ${errTxt}`);
        }
      }

      const data = await res.json();
      const created = normalizeContact(data);
      dispatch({ type: "ADD_CONTACT", payload: created || data });

      // Refresca lista desde el backend para mantener consistencia
      await loadContacts();

      navigate("/contacts");
    } catch (err) {
      dispatch({ type: "ERROR", payload: err.message });
    }
  };

 const updateContact = async (id, payload) => {
  try {
    dispatch({ type: "LOADING" });

    const body = {
      name: String(payload.full_name || payload.name || "").trim(),
      full_name: String(payload.full_name || "").trim(),
      email: String(payload.email || "").trim(),
      phone: String(payload.phone || "").trim(),
      address: String(payload.address || "").trim(),
    };

    // Intento 1: PUT /contacts/{id}
    let res = await fetch(endpoints.contactById(id), {
      method: "PUT",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });

    // Si no existe ese endpoint en tu backend (404), probamos la variante por agenda
    if (res.status === 404) {
      res = await fetch(endpoints.contactInAgenda(id), {
        method: "PUT",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
      });
    }

    if (!res.ok) {
      const errTxt = await readErrorText(res);
      throw new Error(`No se pudo actualizar (${res.status}): ${errTxt}`);
    }

    const data = await res.json();
    const updated = normalizeContact(data);
    dispatch({ type: "UPDATE_CONTACT", payload: updated || data });

    await loadContacts();   // refresca la lista
    navigate("/contacts");  // vuelve a la lista
  } catch (err) {
    dispatch({ type: "ERROR", payload: err.message });
  }
};

const deleteContact = async (id) => {
  try {
    dispatch({ type: "LOADING" });

    const realId = Number(id); // evita “404” por id string

    // Intento 1: DELETE /contacts/{id}
    let res = await fetch(endpoints.contactById(realId), { method: "DELETE" });

    // Si el backend usa la ruta por agenda, probamos:
    if (res.status === 404) {
      res = await fetch(endpoints.contactInAgenda(realId), { method: "DELETE" });
    }

    // Aceptamos 200 o 204 como éxito
    if (![200, 204].includes(res.status)) {
      const errTxt = await readErrorText(res);
      throw new Error(`No se pudo eliminar (${res.status}): ${errTxt}`);
    }

    // Actualiza estado local inmediatamente…
    dispatch({ type: "DELETE_CONTACT", payload: realId });
    // …y sincroniza con backend
    await loadContacts();
  } catch (err) {
    dispatch({ type: "ERROR", payload: err.message });
  }
};

  const setSelected = (contactOrNull) =>
    dispatch({ type: "SET_SELECTED", payload: contactOrNull });

  useEffect(() => {
    loadContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    state,
    actions: { loadContacts, addContact, updateContact, deleteContact, setSelected },
    agenda: AGENDA_SLUG,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/** Hook de consumo */
export const useApp = () => useContext(AppContext);
