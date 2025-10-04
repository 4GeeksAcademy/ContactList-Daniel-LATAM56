// src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AppProvider } from "./storeContacts"; // asegúrate que es .jsx si lleva JSX
import AppRoutes from "./routes.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  </BrowserRouter>
);
