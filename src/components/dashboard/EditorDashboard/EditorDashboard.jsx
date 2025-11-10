// src/components/dashboard/EditorDashboard/EditorDashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import { getAllNews, updateNewsStatus, deleteNews } from "../../../services/newsService";
import NewsList from "../../news/NewsList/NewsList";
import { useAuth } from "../../../contexts/AuthContext";
import toast from "react-hot-toast";
import "./EditorDashboard.css";

export default function EditorDashboard() {
  const { userData } = useAuth();
  const [news, setNews] = useState([]);
  const [filter, setFilter] = useState("Todos");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const loadNews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllNews(filter === "Todos" ? null : filter);
      setNews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando noticias:", err);
      toast.error("No se pudieron cargar las noticias");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadNews();
  }, [loadNews, refreshKey]);

  const handleChangeStatus = async (id, newStatus) => {
    const ok = window.confirm(`¿Confirmas cambiar el estado a "${newStatus}"?`);
    if (!ok) return;
    try {
      await updateNewsStatus(id, newStatus);
      toast.success("Estado actualizado");
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error(err);
      toast.error("No se pudo actualizar el estado");
    }
  };

  const handleDelete = async (id, imagePath) => {
    const ok = window.confirm("¿Eliminar la noticia? Esta acción no se puede deshacer.");
    if (!ok) return;
    try {
      await deleteNews(id, imagePath);
      toast.success("Noticia eliminada");
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error(err);
      toast.error("No se pudo eliminar la noticia");
    }
  };

  const filteredNews = news.filter((n) => {
    if (!search) return true;
    const q = search.trim().toLowerCase();
    const title = (n.title || "").toString().toLowerCase();
    const subtitle = (n.subtitle || "").toString().toLowerCase();
    return title.includes(q) || subtitle.includes(q);
  });

  return (
    <div className="editor-dashboard container mx-auto p-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-jdx-dark">Panel del Editor</h1>
          <p className="text-sm text-gray-500 mt-1">Revisa, publica o desactiva noticias creadas por los reporteros.</p>
        </div>
        <div className="flex gap-2 items-center w-full sm:w-auto">
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border rounded-md bg-white"
            aria-label="Filtrar por estado"
          >
            <option>Todos</option>
            <option>Edición</option>
            <option>Terminado</option>
            <option>Publicado</option>
            <option>Desactivado</option>
          </select>

          <input
            id="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título..."
            className="px-3 py-2 border rounded-md w-full sm:w-72"
            aria-label="Buscar noticias"
          />

          <button onClick={() => setRefreshKey((k) => k + 1)} className="px-3 py-2 bg-jdx-accent text-white rounded-md">
            Refrescar
          </button>
        </div>
      </header>

      <main>
        {loading ? (
          <div className="py-12 text-center text-gray-400">Cargando noticias…</div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-500">{filteredNews.length} resultado(s)</div>
            <NewsList
              news={filteredNews}
              onReload={() => setRefreshKey((k) => k + 1)}
              onChangeStatus={handleChangeStatus}
              onDelete={handleDelete}
            />
          </>
        )}
      </main>
    </div>
  );
}