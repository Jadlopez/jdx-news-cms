// src/components/layout/Header.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";

export default function Header() {
  const { user, userData } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <header style={{ background: "#0f1b2e", color: "#fff", padding: "12px 24px" }}>
      <div className="header-inner" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link to="/" style={{ color: "#00bfae", fontWeight: "700", textDecoration: "none" }}>
          JDX News
        </Link>

        <nav>
          <Link to="/" style={{ color: "#fff", marginRight: 12 }}>Inicio</Link>
          {user ? (
            <>
              <Link to="/dashboard" style={{ color: "#fff", marginRight: 12 }}>Panel</Link>
              <button onClick={handleLogout} style={{ background: "transparent", color: "#fff", border: "1px solid #00bfae", padding: "6px 10px", borderRadius: 8 }}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: "#fff", marginRight: 12 }}>Ingresar</Link>
              <Link to="/register" style={{ color: "#00bfae" }}>Registro</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
