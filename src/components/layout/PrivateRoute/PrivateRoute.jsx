// src/components/layout/PrivateRoute.jsx
import React from "react";
import PropTypes from "prop-types";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

export default function PrivateRoute({ allowedRoles = null }) {
  const { user, userData, loading, authError } = useAuth();
  const location = useLocation();

  // Mientras se verifica la sesión
  if (loading) {
    // If there's an auth error (e.g. login failed), show that to the user instead of the spinner
    if (authError) {
      return (
        <div className="min-h-[40vh] flex items-center justify-center p-6">
          <div className="max-w-md text-center bg-white p-6 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">
              No pudimos iniciar sesión
            </h2>
            <p className="text-sm text-red-600 mb-4">{authError}</p>
            <p className="text-sm text-gray-600 mb-4">
              Verifica tus credenciales e intenta de nuevo.
            </p>
            <div>
              <a href="/login" className="jdx-btn jdx-btn-primary">
                Volver al login
              </a>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-[40vh] flex items-center justify-center p-6">
        <div
          role="status"
          aria-live="polite"
          className="flex flex-col items-center"
        >
          <svg
            className="animate-spin -ml-1 mr-3 h-10 w-10 text-jdx-accent"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>

          <span className="mt-3 text-sm text-gray-600">
            Comprobando sesión, por favor espera…
          </span>
        </div>
      </div>
    );
  }

  // Si no hay usuario autenticado, redirigimos a login y guardamos la ruta de origen
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Si se especifican roles permitidos y el usuario no tiene userData o rol no permitido
  if (allowedRoles && Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const role = userData?.role ?? null;

    // Si aún no hay userData, lo más robusto es mostrar un estado de carga mientras se resuelve.
    // Aquí asumimos que AuthContext resuelve userData durante `loading`.
    if (!role || !allowedRoles.includes(role)) {
      // Redirigir al inicio si no tiene permiso
      return <Navigate to="/" replace state={{ from: location }} />;
    }
  }

  // Si todo OK, renderizamos las rutas hijas
  return <Outlet />;
}

PrivateRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};
