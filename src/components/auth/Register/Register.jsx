import React, { useState } from "react";
import { supabase } from "../../../supabase/client";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import "./Register.css";

export default function Register() {
  const [status, setStatus] = useState("idle");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setStatus("loading");
    toast.dismiss();

    try {
      const { name, email, password } = form;

      if (!name || !email || !password) {
        toast.error("Todos los campos son obligatorios");
        setStatus("idle");
        return;
      }

      console.log("🚀 Registrando usuario con:", { name, email });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: "reportero", // puedes cambiar el rol si quieres
          },
        },
      });

      if (error) throw error;

      console.log("✅ Usuario creado:", data.user);

      toast.success("Cuenta creada con éxito");
      navigate("/login");
    } catch (err) {
      console.error("❌ Error al registrar:", err);
      toast.error(err.message || "Error al registrar");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h2 className="register-title">Registro</h2>

        <form onSubmit={handleRegister}>
          <label htmlFor="name">Nombre completo</label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            disabled={status === "loading"}
            className="register-input"
            required
          />

          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            disabled={status === "loading"}
            className="register-input"
            required
          />

          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            disabled={status === "loading"}
            className="register-input"
            required
          />

          <button
            type="submit"
            disabled={status === "loading"}
            className="register-btn-primary"
          >
            {status === "loading" ? "Creando cuenta..." : "Registrarse"}
          </button>
        </form>

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
