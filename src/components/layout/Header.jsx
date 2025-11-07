// src/components/layout/Header.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import logo from "../../assets/logo.png";
import "./Header.css"; // Importa el CSS externo

export default function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="header-inner">
        {/* Logo a la izquierda */}
        <Link to="/" className="header-logo">
          <img src={logo} alt="JDX News Logo" />
        </Link>

        {/* Nombre centrado */}
        <h1 className="header-title">JDX News</h1>

        {/* Navegación */}
        <nav className="header-nav">
          <Link to="/">Inicio</Link>

          {user ? (
            <>
              <Link to="/dashboard">Panel</Link>
              <button onClick={handleLogout}>Cerrar sesión</button>
            </>
          ) : (
            <>
              <Link to="/login">Ingresar</Link>
              <Link to="/register">Registro</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
