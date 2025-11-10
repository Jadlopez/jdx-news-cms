import React, { useState } from "react";
import { supabase } from "../../../supabase/client";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./Login.css"; // puedes mantenerlo si tienes estilos personalizados

export default function Login() {
  const [status, setStatus] = useState("idle");
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus("loading");
    toast.dismiss();

    try {
      const { email, password } = form;
      if (!email || !password) {
        toast.error("Por favor completa todos los campos");
        setStatus("idle");
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data?.user) throw new Error("No se pudo iniciar sesión.");

      toast.success("Bienvenido/a");
      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Error al iniciar sesión:", err);
      toast.error(err.message || "Error al iniciar sesión");
    } finally {
      setStatus("idle");
    }
  };

  const isBusy = status === "loading";

  return (
    <div className="login-page bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center min-h-screen p-6">
      <div className="login-wrapper w-full max-w-md">
        <form
          onSubmit={handleLogin}
          className="login-card bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden"
          aria-busy={isBusy}
        >
          {isBusy && (
            <div className="login-overlay absolute inset-0 bg-white/75 flex items-center justify-center z-40">
              <div className="spinner" />
            </div>
          )}

          <div className="login-header flex items-center gap-3 mb-4">
            <img
              src={"src/assets/logo.png"}
              alt="App Logo"
              className="login-logo w-12 h-12 object-contain rounded-lg"
            />
            <div>
              <h1 className="login-title text-xl font-bold text-gray-900">
                Inicia sesión
              </h1>
              <p className="login-sub text-gray-500 text-sm">
                Accede al panel de tu aplicación
              </p>
            </div>
          </div>

          {/* EMAIL */}
          <label
            htmlFor="email"
            className="block font-semibold text-gray-700 mb-1"
          >
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            disabled={isBusy}
            placeholder="tu@ejemplo.com"
            className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-teal-400 outline-none mb-3"
            required
          />

          {/* PASSWORD */}
          <label
            htmlFor="password"
            className="block font-semibold text-gray-700 mb-1"
          >
            Contraseña
          </label>
          <div className="flex items-center gap-2 mb-4">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              disabled={isBusy}
              placeholder="••••••••"
              className="flex-1 border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-teal-400 outline-none"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="text-gray-500 hover:text-gray-700"
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
            >
              {showPassword ? "👁️‍🗨️" : "👁️"}
            </button>
          </div>

          {/* BOTÓN LOGIN */}
          <button
            type="submit"
            disabled={isBusy}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-md py-2.5 transition"
          >
            {isBusy ? "Ingresando..." : "Entrar"}
          </button>

          {/* DIVISOR */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-gray-400 text-sm">o</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* REGISTRO */}
          <div className="text-center text-gray-600 text-sm mt-4">
            ¿No tienes cuenta?{" "}
            <Link
              to="/register"
              className="text-teal-600 font-semibold hover:underline"
            >
              Regístrate
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
