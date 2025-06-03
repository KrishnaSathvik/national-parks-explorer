import React from "react";
import 'leaflet/dist/leaflet.css';
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import './styles.css';
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";

// ✅ Add Tailwind class to body
document.body.classList.add("body-base");

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);