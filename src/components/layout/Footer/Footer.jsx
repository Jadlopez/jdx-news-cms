// src/components/layout/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import logo from "../../../assets/logo.png";
import "./Footer.css";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="jdx-footer" role="contentinfo">
      <div className="jdx-footer-inner">
        {/* Marca */}
        <div className="jdx-footer-brand">
          <Link to="/" className="jdx-footer-logo-link" aria-label="Ir al inicio">
            <img src={logo} alt="JDX News" className="jdx-footer-logo" />
          </Link>
          <p className="jdx-footer-desc">CMS de noticias corporativas</p>
        </div>

        {/* Navegación */}
        <nav className="jdx-footer-nav" aria-label="Enlaces del pie de página">
          <Link to="/" className="jdx-footer-link">
            Inicio
          </Link>
          <Link to="/sections" className="jdx-footer-link">
            Secciones
          </Link>
          <Link to="/noticia" className="jdx-footer-link">
            Últimas
          </Link>
          <Link to="/dashboard" className="jdx-footer-link">
            Panel
          </Link>
        </nav>

        {/* Contacto / legales / redes */}
        <div className="jdx-footer-meta">
          <div className="jdx-legal">
            <Link to="/privacy" className="jdx-small-link">
              Política de privacidad
            </Link>
            <Link to="/terms" className="jdx-small-link">
              Términos y condiciones
            </Link>
          </div>

          <div className="jdx-social" aria-hidden="false">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="jdx-social-link"
              aria-label="Twitter de JDX News (se abre en una nueva pestaña)"
            >
              {/* Twitter SVG */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M22 5.92c-.64.28-1.32.47-2.04.55a3.56 3.56 0 0 0 1.56-1.97c-.7.42-1.48.72-2.3.88A3.53 3.53 0 0 0 12 8.2c0 .28.03.56.09.82A10.04 10.04 0 0 1 3 4.6a3.54 3.54 0 0 0 1.09 4.72c-.56-.02-1.09-.17-1.55-.43v.04c0 1.7 1.2 3.12 2.78 3.45a3.52 3.52 0 0 1-1.55.06c.44 1.37 1.7 2.36 3.2 2.39A7.1 7.1 0 0 1 2 18.58a10 10 0 0 0 5.4 1.58c6.48 0 10.03-5.37 10.03-10.02v-.46A7.06 7.06 0 0 0 22 5.92z"
                  fill="currentColor"
                />
              </svg>
            </a>

            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="jdx-social-link"
              aria-label="Facebook de JDX News (se abre en una nueva pestaña)"
            >
              {/* Facebook SVG */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M22 12.07C22 6.48 17.52 2 12 2S2 6.48 2 12.07c0 4.99 3.66 9.12 8.44 9.93v-7.03H8.08v-2.9h2.36V9.41c0-2.33 1.38-3.62 3.5-3.62.99 0 2.03.18 2.03.18v2.23h-1.14c-1.12 0-1.47.7-1.47 1.42v1.7h2.5l-.4 2.9h-2.1v7.03C18.34 21.19 22 17.06 22 12.07z"
                  fill="currentColor"
                />
              </svg>
            </a>

            <a
              href="mailto:contacto@jdxnews.example"
              className="jdx-social-link"
              aria-label="Enviar correo a JDX News"
            >
              {/* Mail SVG */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"
                  fill="currentColor"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="jdx-footer-bottom">
        <small>
          © {year} JDX News — CMS. Hecho con <span aria-hidden="true">❤️</span>
        </small>
      </div>
    </footer>
  );
}
