// src/pages/NotFound/NotFound.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./NotFound.css";

export default function NotFound() {
  return (
    <div className="notfound-page min-h-[60vh] flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404 — Página no encontrada</h1>
        <p className="text-gray-600 mb-6">
          La página que buscas no existe o ha sido movida.
        </p>
        <Link to="/" className="jdx-btn jdx-btn-primary">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
