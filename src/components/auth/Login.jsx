// src/components/auth/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, resetPassword } from "../../services/authService";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginUser(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError("Correo o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!form.email) return setError("Escribe tu correo para restablecer");
    try {
      await resetPassword(form.email);
      setResetSent(true);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container" style={{ maxWidth: 400, margin: "40px auto" }}>
      <h2>Iniciar sesión</h2>
      {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
      {resetSent && <div style={{ color: "green", marginBottom: 8 }}>Correo de recuperación enviado.</div>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={form.email}
          onChange={handleChange}
          required
          style={{ display: "block", width: "100%", marginBottom: 8, padding: 8 }}
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          required
          style={{ display: "block", width: "100%", marginBottom: 12, padding: 8 }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            background: "#00bfae",
            color: "#fff",
            border: "none",
            padding: "10px 16px",
            width: "100%",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p style={{ marginTop: 10 }}>
        ¿Olvidaste tu contraseña?{" "}
        <button onClick={handleReset} style={{ color: "#00bfae", background: "none", border: "none", cursor: "pointer" }}>
          Restablecer
        </button>
      </p>

      <p>
        ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
      </p>
    </div>
  );
}
