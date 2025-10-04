import React, { createContext, useContext, useEffect, useReducer } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Ajusta estos 2 valores a tu preferencia:
 * - AGENDA_SLUG: tu "agenda" en la API (usa solo minúsculas y guiones)
 * - API_BASE: base del playground de 4Geeks Contact List
 */
const AGENDA_SLUG = "daniel_latam56"; // <- cámbialo si tu profesor te dio otro
const API_BASE = "https://playground.4geeks.com/contact";

const AppContext = createContext();

const initialState = {
  contacts: [],
  loading: false,
  error: null,
  selected: null, // para editar
};

function reducer(state, action) {
  switch (action.type) {
    case "LOADING": return { ...state, loading: true, error: null };
    case "ERROR": return { ...state, loading: false, error: action.payload };
    case "SET_CONTACTS": return { ...state, loading: false, contacts: action.payload };
    case "SET_SELECTED": return { ...state, selected: action.payload || null };
    case "ADD_CONTACT": return { ...state, loading: false, contacts: [action.payload, ...state.contacts] };
    case "UPDATE_CONTACT":
      return {
        ...state,
        loading: false,
        contacts: state.contacts.map(c => (c.id === action.payload.id ? action.payload : c)),
      };
    case "DELETE_CONTACT":
      return { ...state, loading: false, contacts: state.contacts.filter(c => c.id !== action.payload) };
    default: return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const navigate = useNavigate();

  // Helpers para endpoints del playground
  const endpoints = {
    listByAgenda: () => `${API_BASE}/agendas/${encodeURIComponent(AGENDA_SLUG)}/contacts`,
    createInAgenda: () => `${API_BASE}/agendas/${encodeURIComponent(AGENDA_SLUG)}/contacts`,
    contactById: (id) => `${API_BASE}/contacts/${id}`,
  };

  const loadContacts = async () => {
    try {
      dispatch({ type: "LOADING" });
      const res = await fetch(endpoints.listByAgenda());
      if (!res.ok) throw new Error(`GET contacts failed: ${res.status}`);
      const data = await res.json();
      // El playground devuelve { contacts: [...] } o directamente array (según versión)
      const list = Array.isArray(data) ? data : (data?.contacts ?? []);
      dispatch({ type: "SET_CONTACTS", payload: list });
    } catch (err) {
      dispatch({ type: "ERROR", payload: err.message });
    }
  };

  const addContact = async (payload) => {
    try {
      dispatch({ type: "LOADING" });
      const res = await fetch(endpoints.createInAgenda(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`POST failed: ${res.status}`);
      const created = await res.json();
      dispatch({ type: "ADD_CONTACT", payload: created });
      navigate("/contacts");
    } catch (err) {
      dispatch({ type: "ERROR", payload: err.message });
    }
  };

  const updateContact = async (id, payload) => {
    try {
      dispatch({ type: "LOADING" });
      const res = await fetch(endpoints.contactById(id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`PUT failed: ${res.status}`);
      const updated = await res.json();
      dispatch({ type: "UPDATE_CONTACT", payload: updated });
      navigate("/contacts");
    } catch (err) {
      dispatch({ type: "ERROR", payload: err.message });
    }
  };

  const deleteContact = async (id) => {
    try {
      dispatch({ type: "LOADING" });
      const res = await fetch(endpoints.contactById(id), { method: "DELETE" });
      if (!res.ok) throw new Error(`DELETE failed: ${res.status}`);
      dispatch({ type: "DELETE_CONTACT", payload: id });
    } catch (err) {
      dispatch({ type: "ERROR", payload: err.message });
    }
  };

  const setSelected = (contactOrNull) => dispatch({ type: "SET_SELECTED", payload: contactOrNull });

  // Cargar al arrancar
  useEffect(() => { loadContacts(); /* eslint-disable-next-line */ }, []);

  const value = {
    state,
    actions: { loadContacts, addContact, updateContact, deleteContact, setSelected },
    agenda: AGENDA_SLUG,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);