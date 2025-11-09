// src/components/auth/Register/Register.jsx
import React, { useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";

import {
  registerUser,
  signInWithGoogle,
  saveUserData,
} from "../../../services/authService";
import { useAuth } from "../../../contexts/AuthContext";
import "./Register.css";

const schema = z.object({
  name: z.string().min(1, "El nombre es obligatorio."),
  email: z
    .string()
    .min(1, "El correo es requerido.")
    .email("Ingresa un correo válido."),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres.")
    .optional(),
});

export default function Register() {
  const { setUserData, setUser } = useAuth() ?? {};
  const navigate = useNavigate();
  const location = useLocation();
  const providerUser = location.state?.providerUser ?? null;
  const redirectTo = location.state?.from ?? "/dashboard/reportero";

  const isMounted = useRef(true);
  useEffect(() => () => (isMounted.current = false), []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: providerUser?.displayName ?? "",
      email: providerUser?.email ?? "",
      password: "",
    },
  });

  useEffect(() => {
    if (providerUser) {
      setValue("name", providerUser.displayName ?? "");
      setValue("email", providerUser.email ?? "");
    }
  }, [providerUser, setValue]);

  const friendlyError = (err) => {
    const msg = (err && (err.code || err.message)) || String(err || "");
    if (/email-already-in-use/i.test(msg))
      return "El correo ya está registrado. Intenta iniciar sesión.";
    if (/invalid-email/i.test(msg)) return "Correo inválido.";
    if (/weak-password/i.test(msg))
      return "La contraseña es débil. Usa al menos 6 caracteres.";
    return err?.message ?? "Error al crear la cuenta. Intenta de nuevo.";
  };

  const onSubmit = async (values) => {
    if (!isMounted.current) return;
    toast.dismiss();
    console.log("Ejecutando registro con valores:", values);
    try {
      const t = toast.loading(
        providerUser ? "Finalizando registro..." : "Creando cuenta..."
      );

      // If providerUser exists, only create profile in DB if missing
      if (providerUser?.uid || providerUser?.id) {
        const uid = providerUser.uid ?? providerUser.id;
        let profile = null;
        try {
          profile = await getUserData(uid);
        } catch (dbErr) {
          console.error("getUserData error:", dbErr);
        }
        if (!profile) {
          const payload = {
            id: uid,
            name: values.name.trim(),
            email: values.email.trim(),
            photoURL: providerUser.photoURL ?? null,
            role: "reportero",
            provider: "google",
            created_at: new Date().toISOString(),
          };
          await saveUserData(uid, payload);
          profile = payload;
        }
        if (typeof setUserData === "function") setUserData(profile);
        toast.success("Registro completado", { id: t });
        navigate(redirectTo, { replace: true });
        return;
      }

      // Normal email/password registration
      if (!values.password || values.password.length < 6) {
        toast.error("La contraseña debe tener al menos 6 caracteres.");
        return;
      }

      const t2 = toast.loading("Creando cuenta...");
      const createdUser = await registerUser(
        values.email.trim(),
        values.password,
        values.name.trim()
      );
      const uid =
        createdUser?.id ??
        createdUser?.user?.id ??
        createdUser?.uid ??
        createdUser?.user?.uid ??
        null;

      let profile = null;
      if (uid) {
        try {
          profile = await getUserData(uid);
        } catch (dbErr) {
          console.error("getUserData after register error:", dbErr);
        }
      }

      if (!profile && uid) {
        const payload = {
          id: uid,
          name: values.name.trim(),
          email: values.email.trim(),
          role: "reportero",
          created_at: new Date().toISOString(),
        };
        try {
          await saveUserData(uid, payload);
          profile = payload;
        } catch (saveErr) {
          console.error("saveUserData error:", saveErr);
        }
      }

      if (typeof setUserData === "function")
        setUserData(
          profile ?? {
            id: uid,
            email: values.email.trim(),
            name: values.name.trim(),
          }
        );

      // También sincronizar el objeto `user` en AuthContext para que
      // PrivateRoute y otros consumidores vean inmediatamente el usuario
      // autenticado (evitar redirecciones por timing).
      if (typeof setUser === "function") {
        // `createdUser` puede venir como objeto user o como { user }
        const createdUserObj =
          createdUser?.id ?? createdUser?.user?.id
            ? createdUser
            : createdUser?.user || createdUser;
        setUser(createdUserObj);
      }
      toast.success("Cuenta creada", { id: t2 });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error("Register error:", err);
      toast.error(friendlyError(err));
    }
  };

  const handleGoogleRegister = async () => {
    if (!isMounted.current) return;
    toast.dismiss();
    try {
      const t = toast.loading("Redirigiendo a Google...");
      await signInWithGoogle();
      toast.success("Continúa con Google", { id: t });
    } catch (err) {
      console.error("Google register error:", err);
      toast.error(err?.message ?? "Error al registrarse con Google.");
    }
  };

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

        {errors.root && (
          <div className="register-error" role="alert">
            {errors.root.message}
          </div>
        )}

        <form
          onSubmit={handleSubmit(async (values) => {
            console.log("Formulario de registro enviado con valores:", values);
            await onSubmit(values);
          })}
          noValidate
        >
          <label htmlFor="name">Nombre completo</label>
          <input
            id="name"
            {...register("name")}
            className="register-input"
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="text-sm text-red-600 mb-2">{errors.name.message}</p>
          )}

          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            {...register("email")}
            className="register-input"
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="text-sm text-red-600 mb-2">{errors.email.message}</p>
          )}

          {!providerUser && (
            <>
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                {...register("password")}
                type="password"
                className="register-input"
                disabled={isSubmitting}
              />
              {errors.password && (
                <p className="text-sm text-red-600 mb-2">
                  {errors.password.message}
                </p>
              )}
            </>
          )}

          <button
            type="submit"
            className="register-btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Procesando..."
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
          disabled={isSubmitting}
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
          <span>{isSubmitting ? "Procesando..." : "Continuar con Google"}</span>
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
