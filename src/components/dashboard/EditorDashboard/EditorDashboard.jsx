//src/components/dashboard/EditorDashboard/EditorDashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
  getAllNews,
  updateNewsStatus,
  deleteNews,
} from "../../../services/newsService";
import NewsList from "../../news/NewsList/NewsList";
import "./EditorDashboard.css";

/**
 * EditorDashboard
 * - Listado de noticias (filtro por estado)
 * - Acciones del editor: Publicar, Desactivar, Devolver a Edición
 *
 * Requisitos previos en services/newsService.js:
 * - getAllNews(status) -> devuelve array
 * - updateNewsStatus(id, newStatus)
 * - deleteNews(id) (opcional)
 *
 * Nota: Para una experiencia más robusta, considera integrar react-query
 * para cacheo y manejo de mutaciones.
 */
export default function EditorDashboard() {
  const [news, setNews] = useState([]);
  const [filter, setFilter] = useState("Todos"); // Todos | Edición | Terminado | Publicado | Desactivado
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0); // para forzar recarga

  const loadNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllNews(filter === "Todos" ? null : filter);
      setNews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando noticias:", err);
      setError("No se pudieron cargar las noticias. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadNews();
  }, [loadNews, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  const handleChangeStatus = async (id, newStatus) => {
    const ok = window.confirm(`¿Confirmas cambiar el estado a "${newStatus}"?`);
    if (!ok) return;
    try {
      await updateNewsStatus(id, newStatus);
      // refrescar list
      handleRefresh();
    } catch (err) {
      console.error("Error actualizando estado:", err);
      alert("No se pudo cambiar el estado. Revisa la consola.");
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm(
      "¿Eliminar la noticia? Esta acción no se puede deshacer."
    );
    if (!ok) return;
    try {
      await deleteNews(id);
      handleRefresh();
    } catch (err) {
      console.error("Error eliminando noticia:", err);
      alert("No se pudo eliminar la noticia.");
    }
  };

  // Filtrado local simple (por título o subtítulo)
  const filteredNews = news.filter((n) => {
    if (!search) return true;
    const q = search.trim().toLowerCase();
    const title = (n.titulo || n.title || "").toString().toLowerCase();
    const subtitle = (n.subtitulo || n.subtitle || "").toString().toLowerCase();
    return title.includes(q) || subtitle.includes(q);
  });

  return (
    <div className="editor-dashboard p-6">
      <div className="editor-header mb-4">
        <h1 className="text-2xl font-bold">Panel del Editor</h1>
        <p className="text-muted">
          Revisa, publica o desactiva noticias creadas por los reporteros.
        </p>
      </div>

      <div className="editor-controls mb-4">
        <div className="control-group">
          <label htmlFor="filter">Filtrar por estado:</label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="control-select"
            aria-label="Filtrar noticias por estado"
          >
            <option>Todos</option>
            <option>Edición</option>
            <option>Terminado</option>
            <option>Publicado</option>
            <option>Desactivado</option>
          </select>
          <button
            onClick={handleRefresh}
            className="control-btn"
            aria-label="Refrescar listado"
          >
            Refrescar
          </button>
        </div>

        <div className="control-group">
          <label htmlFor="search" className="sr-only">
            Buscar
          </label>
          <input
            id="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título o bajante..."
            className="control-input"
            aria-label="Buscar noticias"
          />
        </div>
      </div>

      {error && (
        <div className="editor-error" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="editor-loading">Cargando noticias…</div>
      ) : (
        <>
          <div className="editor-list-meta mb-3">
            <small>{filteredNews.length} resultado(s)</small>
          </div>

          {/* Pasamos múltiples props (compatibilidad con distintas versiones de NewsList) */}
          <NewsList
            news={filteredNews}
            data={filteredNews}
            items={filteredNews}
            onEdit={() => {}}
            onReload={handleRefresh}
            onChangeStatus={handleChangeStatus}
            onDelete={handleDelete}
          />
        </>
      )}
    </div>
  );
}
