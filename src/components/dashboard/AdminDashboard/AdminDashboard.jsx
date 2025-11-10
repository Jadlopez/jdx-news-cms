// src/components/dashboard/AdminDashboard/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { getAllNews } from "../../../services/newsService";
import { supabase } from "../../../supabase/client";
import { useAuth } from "../../../contexts/AuthContext";
import toast from "react-hot-toast";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const { userData } = useAuth();
  const [counts, setCounts] = useState({
    total: 0,
    Edición: 0,
    Terminado: 0,
    Publicado: 0,
    Desactivado: 0,
  });
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [updating, setUpdating] = useState(false);

  // Cargar métricas de noticias
  useEffect(() => {
    async function loadNews() {
      setLoading(true);
      try {
        const list = await getAllNews(null);
        const acc = {
          total: 0,
          Edición: 0,
          Terminado: 0,
          Publicado: 0,
          Desactivado: 0,
        };
        list.forEach((n) => {
          const s = n.status || n.estado || "Edición";
          acc.total += 1;
          acc[s] = (acc[s] || 0) + 1;
        });
        setCounts(acc);
      } catch (err) {
        console.error("Error cargando métricas:", err);
        toast.error("No se pudieron cargar métricas");
      } finally {
        setLoading(false);
      }
    }

    loadNews();
  }, []);

  // Cargar usuarios desde la tabla 'users'
  const loadUsers = async () => {
    try {
      const { data, error } = await supabase.from("users").select("*");
      if (error) throw error;
      setUsers(data);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
      toast.error("No se pudieron cargar los usuarios");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Cambiar rol de usuario
  const handleRoleChange = async (id, newRole) => {
    try {
      setUpdating(true);
      const { error } = await supabase
        .from("users")
        .update({ role: newRole })
        .eq("id", id);

      if (error) throw error;
      toast.success("Rol actualizado correctamente");
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error("Error al actualizar rol:", err);
      toast.error("No se pudo actualizar el rol");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="admin-dashboard p-6 max-w-6xl mx-auto">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Panel de Administrador</h1>
        <p className="text-sm text-gray-600">
          Usuario: {userData?.email ?? "—"} • Rol: {userData?.role ?? "—"}
        </p>
      </header>

      {/* Métricas */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Total noticias</div>
          <div className="text-2xl font-extrabold">{counts.total}</div>
        </div>
        <div className="card p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Publicadas</div>
          <div className="text-2xl font-extrabold">{counts.Publicado || 0}</div>
        </div>
        <div className="card p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">En edición</div>
          <div className="text-2xl font-extrabold">{counts.Edición || 0}</div>
        </div>
      </section>

      {/* Gestión de usuarios */}
      <section className="bg-white p-4 rounded-lg shadow">
        <h2 className="font-semibold mb-3">Gestión de usuarios</h2>
        <p className="text-sm text-gray-500 mb-4">
          Cambia el rol de los usuarios registrados.
        </p>

        {users.length === 0 ? (
          <p className="text-gray-400 text-sm">No hay usuarios registrados.</p>
        ) : (
          <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Rol actual</th>
                <th className="p-2 text-left">Acción</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="p-2">{user.email}</td>
                  <td className="p-2 capitalize">{user.role || "Sin rol"}</td>
                  <td className="p-2">
                    <select
                      value={user.role || ""}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
                      disabled={updating}
                      className="border rounded px-2 py-1"
                    >
                      <option value="">Seleccionar</option>
                      <option value="admin">Admin</option>
                      <option value="editor">Editor</option>
                      <option value="reportero">Reportero</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
