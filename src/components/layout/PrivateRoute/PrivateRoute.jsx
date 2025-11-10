import PropTypes from "prop-types";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

export default function PrivateRoute({ allowedRoles = null }) {
  const { user, userData, loading, authError, refreshUserData } = useAuth();
  const location = useLocation();

  // 1) Si todavía estamos verificando la sesión, mostrar loader
  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center p-6">
        <p>Cargando sesión...</p>
      </div>
    );
  }

  // 2) Si no hay usuario autenticado -> login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 3) Si la app requiere roles y userData aún no llegó, intenta refrescar y muestra loader
  if (allowedRoles && allowedRoles.length > 0) {
    // Si ya llegó userData y no tiene rol permitido -> redirect
    if (userData && !allowedRoles.includes(userData.role)) {
      return (
        <Navigate
          to="/dashboard/no-autorizado"
          replace
          state={{ from: location }}
        />
      );
    }

    // Si no hay userData (null) intenta refrescar y muestra loader para evitar redirect prematuro
    if (!userData) {
      // intenta refrescar una vez (no bloqueante); muestra loader mientras tanto
      // refreshUserData viene del AuthContext y es seguro llamarlo aquí
      refreshUserData?.().catch(() => {});
      return (
        <div className="min-h-[40vh] flex items-center justify-center p-6">
          <p>Cargando perfil de usuario...</p>
        </div>
      );
    }
  }

  // 4) Si todo ok, renderiza rutas hijas
  return <Outlet />;
}

PrivateRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};
