// src/routes.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Contact from "./pages/Contact.jsx";
import AddContact from "./pages/AddContact.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/contacts" replace />} />
      <Route path="/contacts" element={<Contact />} />
      <Route path="/contacts/new" element={<AddContact />} />
      <Route path="/contacts/:id" element={<AddContact />} /> {/* editar */}
      <Route path="*" element={<Navigate to="/contacts" replace />} />
    </Routes>
  );
}
