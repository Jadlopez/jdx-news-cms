// src/components/auth/Login/Login.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginUser, getUserData, signInWithGoogle } from "../../../services/authService";
import { useAuth } from "../../../contexts/AuthContext";
import logo from "../../../assets/logo.png";
import "./Login.css";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";

const schema = z.object({
  email: z.string().min(1, "El correo es requerido.").email("Ingresa un correo válido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
  remember: z.boolean().optional(),
});

export default function Login() {
  const { setUserData } = useAuth() ?? {};
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname ?? "/dashboard";

  const isMounted = useRef(true);
  useEffect(() => () => { isMounted.current = false; }, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: true },
  });

  // Pre-fill email if providerUser present
  useEffect(() => {
    const providerUser = location.state?.providerUser;
    if (providerUser?.email) setValue("email", providerUser.email);
  }, [location.state, setValue]);

  const normalizeUser = (u) => {
    if (!u) return null;
    if (u.uid) return u;
    if (u.user?.uid) return u.user;
    return u;
  };

  const friendlyError = (err) => {
    const msg = (err?.code || err?.message || String(err || "")).toLowerCase();
    if (msg.includes("wrong-password")) return "Correo o contraseña incorrectos.";
    if (msg.includes("user-not-found")) return "No existe una cuenta con ese correo.";
    if (msg.includes("invalid-email")) return "Correo inválido.";
    if (msg.includes("too-many-requests")) return "Demasiados intentos fallidos. Intenta más tarde.";
    // Mostrar mensaje directo si existe (útil en desarrollo)
    if (err?.message) return err.message;
    return "Error al iniciar sesión. Intenta nuevamente.";
  };

  const onSubmit = async (values) => {
    if (!isMounted.current) return;
    try {
      toast.dismiss();
      const t = toast.loading("Iniciando sesión...");
      const raw = await loginUser(values.email.trim(), values.password, { remember: values.remember });
      const user = normalizeUser(raw);
      if (!user?.uid) throw new Error("No se obtuvo uid.");

      const data = await getUserData(user.uid).catch(() => null);
      if (setUserData) setUserData(data ?? { uid: user.uid, email: user.email });

      toast.success("Sesión iniciada", { id: t });

      if (redirectTo && !["/login", "/register"].includes(redirectTo)) {
        navigate(redirectTo, { replace: true });
        return;
      }

      navigate(data?.role === "editor" ? "/dashboard/editor" : "/dashboard/reportero", { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      if (isMounted.current) {
        const message = friendlyError(err);
        toast.dismiss();
        toast.error(message);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isMounted.current) return;
    try {
      toast.dismiss();
      const t = toast.loading("Accediendo con Google...");
      const raw = await signInWithGoogle({ remember: true });
      const user = normalizeUser(raw);
      if (!user?.uid) throw new Error("No se obtuvo información del proveedor.");

      const data = await getUserData(user.uid).catch(() => null);
      if (data) {
        setUserData?.(data);
        toast.success("Bienvenido/a", { id: t });
        navigate(data.role === "editor" ? "/dashboard/editor" : "/dashboard/reportero", { replace: true });
      } else {
        toast.dismiss();
        toast.success("Completa tu registro", { id: t });
        navigate("/register", {
          replace: true,
          state: {
            from: redirectTo ?? "/dashboard/reportero",
            provider: "google",
            providerUser: user,
          },
        });
      }
    } catch (err) {
      console.error("Google sign-in error:", err);
      toast.dismiss();
      toast.error(friendlyError(err));
    }
  };

  const isBusy = isSubmitting;

  return (
    <div className="login-page bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center min-h-screen p-6">
      <div className="login-wrapper w-full max-w-md">
        <form
          data-jdx-login
          onSubmit={handleSubmit(onSubmit)}
          className="login-card bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden"
          aria-busy={isBusy}
        >
          {isBusy && (
            <div className="login-overlay absolute inset-0 bg-white/75 flex items-center justify-center z-40">
              <div className="spinner" />
            </div>
          )}

          <div className="login-header flex items-center gap-3 mb-4">
            <img src={logo} alt="JDX News" className="login-logo w-12 h-12 object-contain rounded-lg" />
            <div>
              <h1 className="login-title text-xl font-bold text-gray-900">Inicia sesión</h1>
              <p className="login-sub text-gray-500 text-sm">Accede al panel de administración</p>
            </div>
          </div>

          {/* mostrar mensajes de validación del formulario */}
          {errors.root && (
            <div role="alert" className="login-error bg-red-50 border border-red-200 text-red-700 rounded-md p-3 mb-3 text-sm">
              {errors.root.message}
            </div>
          )}

          <label htmlFor="email" className="block font-semibold text-gray-700 mb-1">Correo electrónico</label>
          <input
            id="email"
            type="email"
            placeholder="tu@ejemplo.com"
            disabled={isBusy}
            className="login-input w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-teal-400 outline-none mb-3"
            {...register("email")}
          />
          {errors.email && <p className="text-sm text-red-600 mb-2">{errors.email.message}</p>}

          <label htmlFor="password" className="block font-semibold text-gray-700 mb-1">Contraseña</label>
          <div className="login-password-row flex items-center gap-2 mb-4">
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              disabled={isBusy}
              className="login-input-password flex-1 border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-teal-400 outline-none"
              {...register("password")}
            />
          </div>
          {errors.password && <p className="text-sm text-red-600 mb-2">{errors.password.message}</p>}

          <div className="login-row flex justify-between items-center mb-4 text-sm text-gray-600">
            <label className="checkbox-label inline-flex items-center gap-2 cursor-pointer">
              <input type="checkbox" disabled={isBusy} {...register("remember")} />
              <span>Recuérdame</span>
            </label>
            <Link to="/forgot-password" className="link-muted hover:underline">¿Olvidaste tu contraseña?</Link>
          </div>

          <button type="submit" disabled={isBusy} className="btn-primary w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-md py-2.5 transition">
            {isBusy ? "Ingresando..." : "Entrar"}
          </button>

          <div className="login-divider flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="login-divider-content text-gray-400 text-sm">o</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isBusy}
            className="btn-google w-full border border-gray-300 bg-white rounded-md py-2.5 flex items-center justify-center gap-2 text-gray-800 font-medium hover:bg-gray-50 transition"
          >
            <svg width="18" height="18" viewBox="0 0 533.5 544.3" aria-hidden="true">
              <path fill="#4285f4" d="M533.5 278.4c0-17.7-1.6-35.4-4.8-52.5H272v99.4h146.9c-6.4 34.9-26.1 64.4-55.6 84.2v69.9h89.6c52.4-48.3 82.6-119.5 82.6-200.9z"/>
              <path fill="#34a853" d="M272 544.3c73.6 0 135.5-24.4 180.7-66.5l-89.6-69.9c-24.9 16.7-56.6 26.5-91.1 26.5-69.9 0-129.2-47.2-150.4-110.5H31.6v69.5C76.2 487 168.6 544.3 272 544.3z"/>
              <path fill="#fbbc04" d="M121.6 327.9c-11.7-34.9-11.7-72.6 0-107.5V150.9H31.6c-39.3 78.3-39.3 171.6 0 249.9l90-72.9z"/>
              <path fill="#ea4335" d="M272 109.7c38.9-.6 76.5 14.2 104.9 40.8l78.6-78.6C408.1 24.1 344.7-.2 272 0 168.6 0 76.2 57.3 31.6 150.9l90 69.5C142.8 157 202.1 109.7 272 109.7z"/>
            </svg>
            <span>Continuar con Google</span>
          </button>

          <div className="login-footer text-center text-gray-600 text-sm mt-4">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="link-strong text-teal-600 font-semibold hover:underline">Regístrate</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
