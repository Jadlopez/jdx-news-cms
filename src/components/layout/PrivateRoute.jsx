// src/components/layout/PrivateRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

/**
 * Uso:
 * <Route element={<PrivateRoute />}> rutas que requieren auth </Route>
 * o para roles:
 * <Route element={<PrivateRoute allowedRoles={['editor']} />}> ...
 */
export default function PrivateRoute({ allowedRoles = null }) {
  const { user, userData, loading } = useAuth();

  if (loading) {
    return <div>Cargando sesión...</div>; // reemplaza con spinner
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && (!userData || !allowedRoles.includes(userData.role))) {
    // redirigir o mostrar 'no autorizado'
    return <Navigate to="/dashboard/no-autorizado" replace />;
  }

  // Si todo OK, renderiza outlet (las rutas hijas)
  return <Outlet />;
}
