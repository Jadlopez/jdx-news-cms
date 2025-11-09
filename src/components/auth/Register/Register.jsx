// src/components/auth/Register/Register.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  registerUser,
  signInWithGoogle,
  getUserData,
  saveUserData,
} from "../../../services/authService";
import { useAuth } from "../../../contexts/AuthContext";
import "./Register.css";

export default function Register() {
  const { setUserData } = useAuth() ?? {};
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  // Si venimos desde Login+Google sin perfil, Login puede redirigir a /register
  // con location.state.providerUser = { uid, email, displayName, photoURL }
  const providerUser = location.state?.providerUser ?? null;
  const redirectTo = location.state?.from ?? "/dashboard/reportero";

  const isMounted = useRef(true);
  useEffect(
    () => () => {
      isMounted.current = false;
    },
    []
  );

  // Si hay providerUser pre-llenamos nombre/email
  useEffect(() => {
    if (providerUser) {
      setForm((f) => ({
        ...f,
        name: providerUser.displayName ?? f.name,
        email: providerUser.email ?? f.email,
      }));
    }
  }, [providerUser]);

  const emailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const friendlyError = (err) => {
    const msg = (err && (err.code || err.message)) || String(err || "");

    // Supabase error codes
    if (msg.includes("User already registered")) {
      return "El correo ya está registrado. Intenta iniciar sesión o usa otro correo.";
    }
    if (msg.includes("Invalid email")) {
      return "Correo inválido.";
    }
    if (msg.includes("Password should be at least 6 characters")) {
      return "La contraseña es débil. Usa al menos 6 caracteres.";
    }
    if (msg.includes("Database error saving new user")) {
      return "Error al crear el perfil. Verifica que el correo sea válido y no esté en uso.";
    }
    return err?.message ?? "Error al crear la cuenta. Intenta de nuevo.";
  };

  // Flow when user submits the form.
  // Two cases:
  // 1) providerUser exists (OAuth completed but no profile in DB): create profile in Firestore only
  // 2) normal email/password registration -> registerUser (creates auth user + profile in our service)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || loadingGoogle) return;
    setError("");

    if (!form.name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    if (!emailValid(form.email)) {
      setError("Ingresa un correo válido");
      return;
    }

    // Case: completing profile after Google sign-in (providerUser provided)
    if (providerUser?.uid) {
      setLoading(true);
      try {
        const uid = providerUser.uid;
        // Check if profile already exists
        let profile = null;
        try {
          profile = await getUserData(uid);
        } catch (dbCheckErr) {
          console.error("getUserData (complete profile) error:", dbCheckErr);
        }

        if (!profile) {
          const payload = {
            uid,
            name: form.name.trim(),
            email: form.email.trim(),
            photoURL: providerUser.photoURL ?? null,
            role: "reportero",
            provider: "google",
            createdAt: new Date().toISOString(),
          };
          await saveUserData(uid, payload);
          profile = payload;
        }

        if (typeof setUserData === "function") setUserData(profile);
        navigate(redirectTo, { replace: true });
      } catch (err) {
        console.error("Complete profile error:", err);
        if (isMounted.current) setError(friendlyError(err));
      } finally {
        if (isMounted.current) setLoading(false);
      }
      return;
    }

    // Normal email/password registration
    if (!form.password || form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      const createdUser = await registerUser(
        form.email.trim(),
        form.password,
        form.name.trim()
      );
      const uid =
        createdUser?.uid ?? (createdUser?.user && createdUser.user.uid) ?? null;

      // Try read profile (registerUser already writes a doc in our service, but check)
      let profile = null;
      if (uid) {
        try {
          profile = await getUserData(uid);
        } catch (dbErr) {
          console.error("getUserData after register error:", dbErr);
        }
      }

      // If not present, create minimal profile
      if (!profile && uid) {
        const payload = {
          uid,
          name: form.name.trim(),
          email: form.email.trim(),
          role: "reportero",
          createdAt: new Date().toISOString(),
        };
        try {
          await saveUserData(uid, payload);
          profile = payload;
        } catch (saveErr) {
          console.error("saveUserData after register error:", saveErr);
        }
      }

      if (typeof setUserData === "function")
        setUserData(
          profile ?? { uid, email: form.email.trim(), name: form.name.trim() }
        );
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error("Register error:", err);
      if (isMounted.current) setError(friendlyError(err));
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  // Flow when clicking "Continue with Google" in the register page
  // This will open popup and if user signs in we ensure they have a profile in DB.
  const handleGoogleRegister = async () => {
    if (loading || loadingGoogle) return;
    setError("");
    setLoadingGoogle(true);

    try {
      const raw = await signInWithGoogle();
      const user = (raw && (raw.user || raw)) || null;
      const uid = user?.uid;
      const email = user?.email;
      const displayName = user?.displayName;
      const photoURL = user?.photoURL;

      if (!uid)
        throw new Error("No se pudo obtener información del proveedor (uid).");

      // Check if profile exists
      let profile = null;
      try {
        profile = await getUserData(uid);
      } catch (dbErr) {
        console.error("getUserData (google) error:", dbErr);
      }

      if (!profile) {
        const payload = {
          uid,
          email,
          name: displayName ?? "",
          photoURL: photoURL ?? null,
          role: "reportero",
          provider: "google",
          createdAt: new Date().toISOString(),
        };
        await saveUserData(uid, payload);
        profile = payload;
      }

      if (typeof setUserData === "function") setUserData(profile);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error("Google register error:", err);
      if (isMounted.current)
        setError(err?.message ?? "Error al registrarse con Google.");
    } finally {
      if (isMounted.current) setLoadingGoogle(false);
    }
  };

  const isBusy = loading || loadingGoogle;

  return (
    <div className="register-page">
      <div
        className="register-card"
        role="region"
        aria-labelledby="register-title"
      >
        <h2 id="register-title" className="register-title">
          Registro
        </h2>

        {providerUser && (
          <div className="register-note" role="status" aria-live="polite">
            Se detectaron datos desde Google. Completa o confirma tu perfil para
            crear tu cuenta.
          </div>
        )}

        {error && (
          <div className="register-error" role="alert" aria-live="assertive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="name">Nombre completo</label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Nombre completo"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            disabled={isBusy}
            className="register-input"
            autoFocus
          />

          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            disabled={isBusy}
            className="register-input"
          />

          {/* Si venimos de Google, la contraseña no es necesaria / no será usada para crear cuenta OAuth.
              Mostramos el campo sólo para registros por email/password */}
          {!providerUser && (
            <>
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Contraseña"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                disabled={isBusy}
                className="register-input"
              />
            </>
          )}

          <button
            type="submit"
            className="register-btn-primary"
            disabled={isBusy}
            aria-disabled={isBusy}
          >
            {loading
              ? "Creando cuenta..."
              : providerUser
              ? "Finalizar registro"
              : "Registrarse"}
          </button>
        </form>

        <div className="register-divider" aria-hidden="true">
          <span>o</span>
        </div>

        <button
          type="button"
          className="register-btn-google"
          onClick={handleGoogleRegister}
          disabled={isBusy}
          aria-label="Continuar con Google"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 533.5 544.3"
            aria-hidden="true"
            focusable="false"
          >
            <path
              fill="#4285f4"
              d="M533.5 278.4c0-17.7-1.6-35.4-4.8-52.5H272v99.4h146.9c-6.4 34.9-26.1 64.4-55.6 84.2v69.9h89.6c52.4-48.3 82.6-119.5 82.6-200.9z"
            />
            <path
              fill="#34a853"
              d="M272 544.3c73.6 0 135.5-24.4 180.7-66.5l-89.6-69.9c-24.9 16.7-56.6 26.5-91.1 26.5-69.9 0-129.2-47.2-150.4-110.5H31.6v69.5C76.2 487 168.6 544.3 272 544.3z"
            />
            <path
              fill="#fbbc04"
              d="M121.6 327.9c-11.7-34.9-11.7-72.6 0-107.5V150.9H31.6c-39.3 78.3-39.3 171.6 0 249.9l90-72.9z"
            />
            <path
              fill="#ea4335"
              d="M272 109.7c38.9-.6 76.5 14.2 104.9 40.8l78.6-78.6C408.1 24.1 344.7-.2 272 0 168.6 0 76.2 57.3 31.6 150.9l90 69.5C142.8 157 202.1 109.7 272 109.7z"
            />
          </svg>
          <span>
            {loadingGoogle ? "Procesando..." : "Continuar con Google"}
          </span>
        </button>

        <div className="register-footer">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="register-link">
            Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
