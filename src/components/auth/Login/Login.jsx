// src/components/auth/Login/Login.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginUser, getUserData, signInWithGoogle } from "../../../services/authService";
import { useAuth } from "../../../contexts/AuthContext";
import logo from "../../../assets/logo.png";
import "./Login.css";

export default function Login() {
  const { setUserData } = useAuth() ?? {};
  const navigate = useNavigate();
  const location = useLocation();
  // Si no hay ruta de origen, vamos al dashboard por defecto
  const redirectTo = location.state?.from?.pathname ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const isMounted = useRef(true);
  useEffect(() => () => { isMounted.current = false; }, []);

  const normalizeUser = (u) => {
    if (!u) return null;
    if (u.uid) return u;
    if (u.user && u.user.uid) return u.user;
    return u;
  };

  const validate = () => {
    if (!email) return "El correo es requerido.";
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) return "Ingresa un correo válido.";
    if (!password) return "La contraseña es requerida.";
    if (password.length < 6) return "La contraseña debe tener al menos 6 caracteres.";
    return null;
  };

  const friendlyError = (err) => {
    const msg = (err && (err.code || err.message)) || String(err || "");
    if (/wrong-password/i.test(msg) || /auth\/wrong-password/i.test(msg)) {
      return "Correo o contraseña incorrectos.";
    }
    if (/user-not-found/i.test(msg) || /auth\/user-not-found/i.test(msg)) {
      return "No existe una cuenta con ese correo.";
    }
    if (/invalid-email/i.test(msg) || /auth\/invalid-email/i.test(msg)) {
      return "Correo inválido.";
    }
    if (/too-many-requests/i.test(msg) || /auth\/too-many-requests/i.test(msg)) {
      return "Demasiados intentos fallidos. Intenta más tarde.";
    }
    // Si viene message legible, devolverlo (útil en desarrollo / servicios)
    if (err && err.message) return err.message;
    return "Error al iniciar sesión. Revisa tus datos e intenta de nuevo.";
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading || loadingGoogle) return;

    setError("");
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setLoading(true);
    try {
      const raw = await loginUser(email.trim(), password, { remember });
      const user = normalizeUser(raw);
      if (!user?.uid) throw new Error("No se obtuvo uid del proveedor de autenticación.");

      let data = null;
      try {
        data = await getUserData(user.uid);
      } catch (dbErr) {
        // No detenga el flujo si falla la lectura del perfil; permitimos continuar
        console.error("getUserData error:", dbErr);
      }

      if (typeof setUserData === "function") {
        try {
          setUserData(data ?? { uid: user.uid, email: user.email });
        } catch (ctxErr) {
          console.error("setUserData error:", ctxErr);
        }
      }

      // Si ruta de origen, ir allí; si no, dirigir según rol si existe
      if (redirectTo && redirectTo !== "/login" && redirectTo !== "/register") {
        navigate(redirectTo, { replace: true });
        return;
      }

      if (data?.role === "editor") navigate("/dashboard/editor", { replace: true });
      else navigate("/dashboard/reportero", { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      if (isMounted.current) setError(friendlyError(err));
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (loading || loadingGoogle) return;
    setError("");
    setLoadingGoogle(true);
    try {
      const raw = await signInWithGoogle({ remember });
      const user = normalizeUser(raw);
      if (!user?.uid) throw new Error("No se obtuvo información del usuario desde el proveedor.");

      let data = null;
      try { data = await getUserData(user.uid); } catch (dbErr) { console.error("getUserData error (google):", dbErr); }

      if (data) {
        if (typeof setUserData === "function") setUserData(data);
        if (redirectTo && redirectTo !== "/login" && redirectTo !== "/register") { navigate(redirectTo, { replace: true }); return; }
        if (data?.role === "editor") navigate("/dashboard/editor", { replace: true });
        else navigate("/dashboard/reportero", { replace: true });
      } else {
        // Si no existe perfil en DB, dirigir a registro con datos prellenados
        navigate("/register", {
          replace: true,
          state: {
            from: redirectTo ?? "/dashboard/reportero",
            provider: "google",
            providerUser: {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
            },
          },
        });
      }
    } catch (err) {
      console.error("Google sign-in error:", err);
      if (isMounted.current) setError(friendlyError(err));
    } finally {
      if (isMounted.current) setLoadingGoogle(false);
    }
  };

  const isBusy = loading || loadingGoogle;

  return (
    <div className="login-page">
      <div className="login-wrapper">
        <form
          data-jdx-login
          onSubmit={handleLogin}
          className="login-card"
          aria-describedby="form-error"
          noValidate
          aria-busy={isBusy}
        >
          {isBusy && (
            <div className="login-overlay" aria-hidden="true">
              <div className="spinner" aria-hidden="true" />
            </div>
          )}

          <div className="login-header">
            <img src={logo} alt="JDX News" className="login-logo" />
            <div>
              <h1 className="login-title">Inicia sesión</h1>
              <p className="login-sub">Accede al panel de administración</p>
            </div>
          </div>

          {error && (
            <div id="form-error" role="alert" className="login-error" aria-live="polite">
              {error}
            </div>
          )}

          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            className="login-input"
            placeholder="tu@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isBusy}
            required
            autoFocus
          />

          <label htmlFor="password">Contraseña</label>
          <div className="login-password-row">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className="login-input login-input-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isBusy}
              required
            />
            <button
              type="button"
              className="btn-icon"
              onClick={() => setShowPassword((s) => !s)}
              aria-pressed={showPassword}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              disabled={isBusy}
            >
              {showPassword ? "👁️‍🗨️" : "👁️"}
            </button>
          </div>

          <div className="login-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                disabled={isBusy}
              />
              <span>Recuérdame</span>
            </label>

            <Link to="/forgot-password" className="link-muted">¿Olvidaste tu contraseña?</Link>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isBusy}
            aria-disabled={isBusy}
            aria-live="polite"
          >
            {loading ? "Ingresando..." : "Entrar"}
          </button>

          <div className="login-divider" aria-hidden="true">
            <div className="login-divider-content">o</div>
          </div>

          <button
            type="button"
            className="btn-google"
            onClick={handleGoogleSignIn}
            disabled={isBusy}
            aria-label="Continuar con Google"
          >
            <svg width="18" height="18" viewBox="0 0 533.5 544.3" aria-hidden="true">
              <path fill="#4285f4" d="M533.5 278.4c0-17.7-1.6-35.4-4.8-52.5H272v99.4h146.9c-6.4 34.9-26.1 64.4-55.6 84.2v69.9h89.6c52.4-48.3 82.6-119.5 82.6-200.9z"/>
              <path fill="#34a853" d="M272 544.3c73.6 0 135.5-24.4 180.7-66.5l-89.6-69.9c-24.9 16.7-56.6 26.5-91.1 26.5-69.9 0-129.2-47.2-150.4-110.5H31.6v69.5C76.2 487 168.6 544.3 272 544.3z"/>
              <path fill="#fbbc04" d="M121.6 327.9c-11.7-34.9-11.7-72.6 0-107.5V150.9H31.6c-39.3 78.3-39.3 171.6 0 249.9l90-72.9z"/>
              <path fill="#ea4335" d="M272 109.7c38.9-.6 76.5 14.2 104.9 40.8l78.6-78.6C408.1 24.1 344.7-.2 272 0 168.6 0 76.2 57.3 31.6 150.9l90 69.5C142.8 157 202.1 109.7 272 109.7z"/>
            </svg>
            <span>Continuar con Google</span>
          </button>

          <div className="login-footer">
            ¿No tienes cuenta? <Link to="/register" className="link-strong">Regístrate</Link>
          </div>
        </form>
      </div>
    </div>
  );
}