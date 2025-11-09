//src/components/dashboard/EditorDashboard/EditorDashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import { getAllNews, updateNewsStatus, deleteNews } from "../../../services/newsService";
import NewsList from "../../news/NewsList";
import { usePreviewAuth } from "../../../hooks/usePreviewAuth";
import "./EditorDashboard.css";

/**
 * EditorDashboard (mejorado)
 * - Permite visualizar sin auth si VITE_DEV_PREVIEW=true (usa hook usePreviewAuth)
 * - Muestra banner de preview cuando aplica y permite cambiar rol de preview desde localStorage
 * - Conserva las mismas acciones (publicar/desactivar/eliminar)
 */

export default function EditorDashboard() {
  const { user, userData, isPreview, setPreviewRole } = usePreviewAuth();
  const [news, setNews] = useState([]);
  const [filter, setFilter] = useState("Todos");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

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

  const handleRefresh = () => setRefreshKey((k) => k + 1);

  const handleChangeStatus = async (id, newStatus) => {
    const ok = window.confirm(`¿Confirmas cambiar el estado a "${newStatus}"?`);
    if (!ok) return;
    try {
      await updateNewsStatus(id, newStatus);
      handleRefresh();
    } catch (err) {
      console.error("Error actualizando estado:", err);
      alert("No se pudo cambiar el estado. Revisa la consola.");
    }
  };

  const handleDelete = async (id, imagePath) => {
    const ok = window.confirm("¿Eliminar la noticia? Esta acción no se puede deshacer.");
    if (!ok) return;
    try {
      await deleteNews(id, imagePath);
      handleRefresh();
    } catch (err) {
      console.error("Error eliminando noticia:", err);
      alert("No se pudo eliminar la noticia.");
    }
  };

  const filteredNews = news.filter((n) => {
    if (!search) return true;
    const q = search.trim().toLowerCase();
    const title = (n.titulo || n.title || "").toString().toLowerCase();
    const subtitle = (n.subtitulo || n.subtitle || "").toString().toLowerCase();
    return title.includes(q) || subtitle.includes(q);
  });

  return (
    <div className="editor-dashboard p-6">
      {isPreview && (
        <div className="preview-banner" style={{ marginBottom: 12, padding: 10, borderRadius: 8, background: "#fffbeb", border: "1px solid #fef3c7" }}>
          <strong>Modo PREVIEW activo</strong> — estás viendo el dashboard sin autenticación.
          <div style={{ marginTop: 6, display: "flex", gap: 8, alignItems: "center" }}>
            <small>Role actual: <code style={{ padding: "2px 6px", background: "#fff", borderRadius: 6 }}>{userData?.role}</code></small>
            <button className="control-btn" onClick={() => { setPreviewRole("reportero"); }}>Ver como Reportero</button>
            <button className="control-btn" onClick={() => { setPreviewRole("editor"); }}>Ver como Editor</button>
            <button className="control-btn" onClick={() => { setPreviewRole("admin"); }}>Ver como Admin</button>
          </div>
        </div>
      )}

      <div className="editor-header mb-4">
        <h1 className="text-2xl font-bold">Panel del Editor</h1>
        <p className="text-muted">Revisa, publica o desactiva noticias creadas por los reporteros.</p>
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
          <button onClick={handleRefresh} className="control-btn" aria-label="Refrescar listado">Refrescar</button>
        </div>

        <div className="control-group">
          <label htmlFor="search" className="sr-only">Buscar</label>
          <input id="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por título o bajante..." className="control-input" aria-label="Buscar noticias" />
        </div>
      </div>

      {error && <div className="editor-error" role="alert">{error}</div>}

      {loading ? (
        <div className="editor-loading">Cargando noticias…</div>
      ) : (
        <>
          <div className="editor-list-meta mb-3"><small>{filteredNews.length} resultado(s)</small></div>

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