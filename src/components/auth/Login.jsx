// src/components/auth/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, getUserData } from "../../services/authService";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // loginUser devuelve el objeto 'data' de Supabase, que contiene 'user'
      const { user } = await loginUser(email, password);
      if (!user) throw new Error("No se pudo iniciar sesión.");

      // Obtener perfil desde la tabla 'usuarios' y normalizar role
      const profile = await getUserData(user.id);
      const role = (profile?.role ?? profile?.rol ?? "").toString().toLowerCase();

      // Redirigir según rol (normalizado a minúsculas)
      if (role === "editor") {
        navigate("/dashboard/editor");
      } else {
        navigate("/dashboard/reportero");
      }
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      setError("Correo o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-lg w-96 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center text-jdx-dark">Iniciar Sesión</h2>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded-lg"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded-lg"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-jdx-accent text-white p-2 rounded-lg hover:bg-jdx-dark transition"
        >
          {loading ? "Ingresando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
};

export default Login;
