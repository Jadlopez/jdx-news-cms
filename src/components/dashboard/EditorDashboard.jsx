// src/components/dashboard/EditorDashboard.jsx
import React, { useEffect, useState } from "react";
import { getAllNews } from "../../services/newsService";
import NewsList from "../news/NewsList";

export default function EditorDashboard() {
  const [news, setNews] = useState([]);
  const [filter, setFilter] = useState("Todos"); // Todos | Edición | Terminado | Publicado | Desactivado

  const loadNews = async () => {
    // si quieres filtrar desde servidor usa getAllNews(status)
    const data = await getAllNews(filter === "Todos" ? null : filter);
    setNews(data);
  };

  useEffect(() => {
    loadNews();
  }, [filter]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Panel del Editor</h1>

      <div className="mb-4 flex gap-2 items-center">
        <label className="text-sm">Filtrar por estado:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="p-2 border rounded">
          <option>Todos</option>
          <option>Edición</option>
          <option>Terminado</option>
          <option>Publicado</option>
          <option>Desactivado</option>
        </select>
        <button onClick={loadNews} className="px-3 py-2 bg-teal-500 text-white rounded">Refrescar</button>
      </div>

      <NewsList news={news} onEdit={() => {}} refresh={loadNews} />
    </div>
  );
}
