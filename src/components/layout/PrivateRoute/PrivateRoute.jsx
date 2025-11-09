// src/components/layout/PrivateRoute/PrivateRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

export default function PrivateRoute({ allowedRoles = [] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Esperando sesión cargue
  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        Cargando sesión...
      </div>
    );
  }

  // Si no está autenticado → login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Si la ruta requiere rol y el usuario no lo tiene → sin permisos
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard/no-autorizado" replace />;
  }

  return <Outlet />;
}
