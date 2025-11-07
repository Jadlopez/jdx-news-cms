// src/components/dashboard/ReporterDashboard.jsx
import React, { useEffect, useState } from "react";
import { getNewsByAuthor } from "../../services/newsService";
import NewsForm from "../news/NewsForm";
import NewsList from "../news/NewsList";
import { useAuth } from "../../contexts/AuthContext";

const ReporterDashboard = () => {
  const { user } = useAuth();
  const [news, setNews] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Carga noticias cuando el usuario está disponible
  useEffect(() => {
    if (user?.email) {
      loadNews();
    }
  }, [user]);

  const loadNews = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const list = await getNewsByAuthor(user.email);
      setNews(list);
    } catch (error) {
      console.error("Error cargando noticias:", error);
      alert("Ocurrió un error al cargar tus noticias.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-jdx-dark">Panel de Reportero</h1>
      <NewsForm existing={editing} onSaved={() => { setEditing(null); loadNews(); }} />
      {loading ? (
        <p className="text-gray-500">Cargando noticias...</p>
      ) : (
        <NewsList data={news} onEdit={setEditing} onReload={loadNews} />
      )}
    </div>
  );
};

export default ReporterDashboard;

