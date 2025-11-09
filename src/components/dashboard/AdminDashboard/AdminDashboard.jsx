/src/components/dashboard/AdminDashboard/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { getAllNews } from "../../../services/newsService";
import { useAuth } from "../../../contexts/AuthContext";
import toast from "react-hot-toast";
import "./AdminDashboard.css";

/**
 * AdminDashboard
 * - Muestra métricas globales y enlaces rápidos
 * - Ideal para gestión de usuarios / asignación de roles (puedes integrar useAssignRole)
 */

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

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const list = await getAllNews(null);
        const acc = { total: 0, Edición: 0, Terminado: 0, Publicado: 0, Desactivado: 0 };
        list.forEach((n) => {
          const s = (n.status || n.estado || "Edición");
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

    load();
  }, []);

  // Si deseas integrar asignación de roles, aquí iría la UI para buscar usuarios y asignar roles.
  // Puedes llamar al hook useAssignRole que hace POST a la Edge Function (backend).

  return (
    <div className="admin-dashboard p-6 max-w-6xl mx-auto">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Panel de Administrador</h1>
        <p className="text-sm text-gray-600">Usuario: {userData?.email ?? "—"} • Rol: {userData?.role ?? "—"}</p>
      </header>

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

      <section className="bg-white p-4 rounded-lg shadow">
        <h2 className="font-semibold mb-3">Gestión de usuarios</h2>
        <p className="text-sm text-gray-500">Aquí puedes integrar la lista de usuarios y la asignación de roles (Edge Function).</p>
        <div className="mt-3">
          <button
            className="px-3 py-2 rounded bg-blue-600 text-white"
            onClick={() => toast.info("Integrar useAssignRole para asignar roles")}
          >
            Abrir gestor de usuarios (pendiente)
          </button>
        </div>
      </section>
    </div>
  );
}