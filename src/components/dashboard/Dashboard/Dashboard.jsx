//src/components/dashboard/Dashboard/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllNews } from "../../../services/newsService";
import { useAuth } from "../../../contexts/AuthContext";
import "./Dashboard.css"; // Mantienes tu propio estilo JDX

export default function Dashboard() {
  const { userData } = useAuth() ?? {};
  const navigate = useNavigate();

  const [allNews, setAllNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getAllNews(null);
      setAllNews(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Error cargando resumen:", err);
      setError("No se pudo cargar el resumen de noticias.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const getStatus = (n) => n?.estado ?? n?.status ?? "Edición";
  const counts = allNews.reduce(
    (acc, n) => {
      const s = getStatus(n);
      acc.total += 1;
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    },
    { total: 0 }
  );

  const goToRoleDashboard = () => {
    if (!userData?.role) {
      setError(
        "No se pudo determinar tu rol. Por favor, cierra sesión y vuelve a intentar."
      );
      return;
    }
    if (userData.role === "editor") {
      navigate("/dashboard/editor");
    } else if (userData.role === "reportero") {
      navigate("/dashboard/reportero");
    } else {
      setError(
        "No tienes un rol válido para acceder a los paneles específicos."
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 jdx-dashboard text-[#0f1b2e]">
      <header className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 jdx-dashboard-header">
        <div>
          <h1 className="text-xl font-bold mb-1 jdx-dashboard-title">
            Panel Principal
          </h1>
          <p className="text-gray-500 text-sm jdx-dashboard-sub">
            Resumen de noticias y accesos rápidos —{" "}
            {userData?.role ?? "Invitado"}
          </p>
        </div>

        <div className="flex gap-2 jdx-dashboard-actions">
          <button
            className="jdx-btn jdx-btn-secondary"
            onClick={load}
            disabled={loading}
          >
            {loading ? "Cargando…" : "Refrescar"}
          </button>
          <button
            className="jdx-btn jdx-btn-primary"
            onClick={goToRoleDashboard}
          >
            Ir al Panel
          </button>
        </div>
      </header>

      {error && (
        <div className="p-3 mb-4 rounded-md bg-red-50 text-red-600 border border-red-100 jdx-dashboard-error">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 jdx-dashboard-grid">
        {["Total", "Edición", "Terminado", "Publicado", "Desactivado"].map(
          (status) => (
            <article
              key={status}
              className="bg-white rounded-xl shadow-md p-4 flex flex-col gap-1 jdx-card"
            >
              <div className="text-gray-500 font-semibold text-sm jdx-card-title">
                {status}
              </div>
              <div className="text-2xl font-extrabold jdx-card-value">
                {status === "Total" ? counts.total : counts[status] || 0}
              </div>
            </article>
          )
        )}
      </section>

      <footer className="mt-6 text-right text-gray-500 text-sm jdx-dashboard-footer">
        Última actualización:{" "}
        {loading ? "actualizando…" : new Date().toLocaleString()}
      </footer>
    </div>
  );
}
