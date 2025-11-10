// src/components/dashboard/ReporterDashboard/ReporterDashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import { deleteNews, getNewsByAuthor } from "../../../services/newsService";
import NewsForm from "../../news/NewsForm/NewsForm";
import NewsList from "../../news/NewsList/NewsList";
import { useAuth } from "../../../contexts/AuthContext";
import "./ReporterDashboard.css";

export default function ReporterDashboard() {
  const { user, userData } = useAuth();
  const [news, setNews] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Mantener estado del formulario entre pestañas
  const [showForm, setShowForm] = useState(() => {
    return localStorage.getItem("reporter_showForm") === "true";
  });

  useEffect(() => {
    localStorage.setItem("reporter_showForm", showForm);
  }, [showForm]);

  const loadNews = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);

    try {
      const list = await getNewsByAuthor(user.id);
      setNews(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Error cargando noticias:", err);
      setError("Error al cargar tus noticias.");
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

  const handleDelete = async (id, imagePath) => {
    const ok = window.confirm(
      "¿Eliminar esta noticia? Esta acción no se puede deshacer."
    );
    if (!ok) return;

    try {
      await deleteNews(id, imagePath);
      await loadNews();
    } catch (err) {
      console.error("Error eliminando noticia:", err);
      alert("No se pudo eliminar la noticia.");
    }
  };

  return (
    <div className="reporter-dashboard p-6">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-jdx-dark">
            Panel de Reportero
          </h1>
          <p className="text-gray-600 text-sm">
            Usuario: {userData?.email ?? user?.email ?? "—"}
          </p>
        </div>

        <button
          className="jdx-btn jdx-btn-outline"
          onClick={() => {
            setShowForm((prev) => {
              const newValue = !prev;
              if (newValue === false) setEditing(null);
              return newValue;
            });
          }}
        >
          {showForm ? "Ocultar formulario" : "Crear noticia"}
        </button>
      </header>

      {showForm && (
        <NewsForm
          existing={editing}
          onSaved={() => {
            setEditing(null);
            loadNews();
          }}
        />
      )}

      {error && (
        <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <p>Cargando noticias…</p>
      ) : (
        <NewsList news={news} onEdit={handleEdit} onDelete={handleDelete} />
      )}
    </div>
  );
}
