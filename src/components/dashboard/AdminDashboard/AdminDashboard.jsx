// src/components/dashboard/AdminDashboard/AdminDashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import { getAllNews } from "../../../services/newsService";
import { useAuth } from "../../../contexts/AuthContext";
import toast from "react-hot-toast";
import { getAllUsers, softDeleteUser } from "../../../services/userService";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const { userData, refreshUserData } = useAuth();
  const [counts, setCounts] = useState({
    total: 0,
    Edición: 0,
    Terminado: 0,
    Publicado: 0,
    Desactivado: 0,
  });
  const [users, setUsers] = useState([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [query, setQuery] = useState("");

  const loadNewsMetrics = useCallback(async () => {
    setLoadingNews(true);
    try {
      const list = await getAllNews(null);
      const acc = {
        total: 0,
        Edición: 0,
        Terminado: 0,
        Publicado: 0,
        Desactivado: 0,
      };
      (list || []).forEach((n) => {
        const s = n.status || n.estado || "Edición";
        acc.total += 1;
        acc[s] = (acc[s] || 0) + 1;
      });
      setCounts(acc);
    } catch (err) {
      console.error("Error cargando métricas:", err);
      toast.error("No se pudieron cargar métricas");
    } finally {
      setLoadingNews(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const data = await getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
      toast.error("No se pudieron cargar los usuarios");
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    loadNewsMetrics();
    loadUsers();
  }, [loadNewsMetrics, loadUsers]);

  const handleRoleChange = async (id, newRole) => {
    try {
      await fetch("/api/heartbeat", { method: "HEAD" }); // noop to keep UX snappy
      const res = await fetch("/api/update-user-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, role: newRole }),
      });
      // fallback: si no tienes endpoint, intenta con supabase directo desde userService (tu AdminDashboard original hacía update con supabase)
      if (!res.ok) {
        // fallback a supabase (silencioso) si no existe endpoint
        const { supabase } = await import("../../../supabase/client.js");
        const { error } = await supabase.from("users").update({ role: newRole }).eq("id", id);
        if (error) throw error;
      }
      toast.success("Rol actualizado");
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: newRole } : u)));
      if (userData?.id === id && typeof refreshUserData === "function") await refreshUserData();
    } catch (err) {
      console.error("Error actualizando rol:", err);
      toast.error("No se pudo actualizar el rol");
    }
  };

  const handleDisable = async (id) => {
    const ok = window.confirm("¿Marcar este usuario como inactivo? Se le impedirá el acceso.");
    if (!ok) return;
    try {
      await softDeleteUser(id);
      toast.success("Usuario desactivado");
      await loadUsers();
      if (userData?.id === id && typeof refreshUserData === "function") await refreshUserData();
    } catch (err) {
      console.error("Error desactivando usuario:", err);
      toast.error("No se pudo desactivar el usuario");
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!query) return true;
    return (u.email || "").toLowerCase().includes(query.toLowerCase());
  });

  return (
    <div className="admin-dashboard container mx-auto p-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-jdx-dark">Panel de Administrador</h1>
          <p className="text-sm text-gray-500 mt-1">Usuario: {userData?.email ?? "—"} • Rol: {userData?.role ?? "—"}</p>
        </div>
        <div className="flex gap-2 items-center">
          <input
            type="search"
            placeholder="Buscar usuario por email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-jdx-accent focus:outline-none w-full sm:w-80"
            aria-label="Buscar usuarios"
          />
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <article className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total noticias</p>
          <p className="text-3xl font-extrabold mt-2">{loadingNews ? "..." : counts.total}</p>
        </article>
        <article className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">Publicadas</p>
          <p className="text-3xl font-extrabold mt-2">{loadingNews ? "..." : counts.Publicado || 0}</p>
        </article>
        <article className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">En edición</p>
          <p className="text-3xl font-extrabold mt-2">{loadingNews ? "..." : counts.Edición || 0}</p>
        </article>
      </section>

      <section className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium">Gestión de usuarios</h2>
          <p className="text-sm text-gray-400">{users.length} registrado(s)</p>
        </div>

        {loadingUsers ? (
          <div className="py-8 text-center text-gray-400">Cargando usuarios…</div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-8 text-center text-gray-400">No hay usuarios registrados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3">Usuario</th>
                  <th className="text-left p-3">Rol</th>
                  <th className="text-left p-3">Estado</th>
                  <th className="text-left p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="p-3 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-sm text-gray-500 overflow-hidden">
                        {u.avatar_url ? <img src={u.avatar_url} alt="avatar" className="w-full h-full object-cover" /> : (u.name ? u.name.slice(0,1).toUpperCase() : u.email?.slice(0,1).toUpperCase())}
                      </div>
                      <div>
                        <div className="font-medium text-jdx-dark">{u.name || "-"}</div>
                        <div className="text-xs text-gray-500">{u.email}</div>
                      </div>
                    </td>

                    <td className="p-3">
                      <select
                        value={u.role || ""}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="px-2 py-1 border rounded-md bg-white"
                        aria-label={`Cambiar rol de ${u.email}`}
                      >
                        <option value="">Seleccionar</option>
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                        <option value="reportero">Reportero</option>
                      </select>
                    </td>

                    <td className="p-3">
                      {u.active === false ? (
                        <span className="inline-block px-2 py-1 text-xs rounded-full bg-red-50 text-red-600">Inactivo</span>
                      ) : (
                        <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-50 text-green-600">Activo</span>
                      )}
                    </td>

                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDisable(u.id)}
                          className="px-3 py-1 rounded-md bg-red-500 text-white text-sm hover:bg-red-600"
                          aria-label={`Desactivar ${u.email}`}
                        >
                          Desactivar
                        </button>
                        <button
                          onClick={() => { navigator.clipboard?.writeText(u.email); toast.success("Email copiado"); }}
                          className="px-3 py-1 rounded-md border text-sm"
                        >
                          Copiar email
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}