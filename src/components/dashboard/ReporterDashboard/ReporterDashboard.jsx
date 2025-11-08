// src/components/dashboard/ReporterDashboard/ReporterDashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import { getNewsByAuthor, deleteNews } from "../../../services/newsService";
import NewsForm from "../../news/NewsForm";
import NewsList from "../../news/NewsList";
import { useAuth } from "../../../contexts/AuthContext";
import "./ReporterDashboard.css";

/**
 * ReporterDashboard
 * - Muestra formulario para crear/editar noticias (NewsForm)
 * - Lista las noticias del autor
 * - Permite editar y eliminar (si tu service lo soporta)
 *
 * Se procura:
 * - Manejo claro de loading / errores
 * - Confirmaciones en acciones destructivas
 * - Reutilización de NewsList (enviando varias props por compatibilidad)
 */
const ReporterDashboard = () => {
  const { user } = useAuth();
  const [news, setNews] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(true);

  const loadNews = useCallback(async () => {
    if (!user?.email) return;
    setLoading(true);
    setError(null);
    try {
      const list = await getNewsByAuthor(user.email);
      setNews(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Error cargando noticias:", err);
      setError("Ocurrió un error al cargar tus noticias.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  const handleEdit = (item) => {
    setEditing(item);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("¿Eliminar esta noticia? Esta acción no se puede deshacer.");
    if (!ok) return;
    try {
      await deleteNews(id);
      await loadNews();
    } catch (err) {
      console.error("Error eliminando noticia:", err);
      alert("No se pudo eliminar la noticia.");
    }
  };

  return (
    <div className="reporter-dashboard p-6">
      <div className="reporter-header mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-jdx-dark">Panel de Reportero</h1>
        <div>
          <button
            className="jdx-btn jdx-btn-outline"
            onClick={() => {
              setShowForm((s) => !s);
              if (!showForm) setEditing(null);
            }}
            aria-pressed={showForm}
          >
            {showForm ? "Ocultar formulario" : "Crear noticia"}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="reporter-form mb-6">
          <NewsForm
            existing={editing}
            onSaved={async () => {
              setEditing(null);
              await loadNews();
            }}
            onCancel={() => {
              setEditing(null);
              setShowForm(false);
            }}
          />
        </div>
      )}

      {error && <div className="reporter-error" role="alert">{error}</div>}

      {loading ? (
        <p className="text-muted">Cargando noticias...</p>
      ) : (
        <div>
          <h2 className="text-lg font-semibold mb-3">Mis noticias</h2>

          <NewsList
            news={news}
            data={news}
            items={news}
            onEdit={handleEdit}
            onReload={loadNews}
            onDelete={handleDelete}
          />
        </div>
      )}
    </div>
  );
};

export default ReporterDashboard;

