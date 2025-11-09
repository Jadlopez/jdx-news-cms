// src/components/layout/Header.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { supabase } from "../../../supabase/client";
import logo from "../../../assets/logo.png";
import "./Header.css";

export default function Header() {
  const { user, logout } = useAuth() ?? {};
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Cerrar menú al hacer click fuera (mejora UX)
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("Error al cerrar sesión. Intente nuevamente.");
    }
  };

  return (
    <header className="jdx-header">
      <div className="jdx-header-inner">
        <Link to="/" className="jdx-logo-link" aria-label="Ir al inicio">
          <img src={logo} alt="JDX News" className="jdx-logo" />
        </Link>

        {/* Botón hamburguesa (visible en móviles) */}
        <button
          className="jdx-menu-btn"
          aria-controls="primary-navigation"
          aria-expanded={open}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((s) => !s)}
        >
          <span
            className={`hamburger ${open ? "is-active" : ""}`}
            aria-hidden="true"
          />
        </button>

        {/* Navegación principal */}
        <nav
          ref={menuRef}
          id="primary-navigation"
          className={`jdx-nav ${open ? "open" : ""}`}
        >
          <Link to="/" className="jdx-nav-link" onClick={() => setOpen(false)}>
            Inicio
          </Link>

          {user ? (
            <>
              <Link
                to="/dashboard"
                className="jdx-nav-link"
                onClick={() => setOpen(false)}
              >
                Panel
              </Link>
              <button
                className="jdx-nav-link jdx-logout"
                onClick={() => {
                  setOpen(false);
                  handleLogout();
                }}
                type="button"
                aria-label="Cerrar sesión"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="jdx-nav-link"
                onClick={() => setOpen(false)}
              >
                Ingresar
              </Link>
              <Link
                to="/register"
                className="jdx-nav-link jdx-register"
                onClick={() => setOpen(false)}
              >
                Registro
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
