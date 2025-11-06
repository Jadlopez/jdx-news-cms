// src/components/dashboard/ReporterDashboard.jsx
import React, { useEffect, useState } from "react";
import { getAllNews } from "../../services/newsService";
import NewsForm from "../news/NewsForm";
import NewsList from "../news/NewsList";
import { useAuth } from "../../contexts/AuthContext";

export default function ReporterDashboard() {
  const [news, setNews] = useState([]);
  const [editing, setEditing] = useState(null);
  const { user } = useAuth();

  const loadNews = async () => {
    const all = await getAllNews();
    // mostrar solo las noticias del autor (reportero)
    setNews(all.filter((n) => n.author === user?.email));
  };

  useEffect(() => {
    loadNews();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Panel del Reportero</h1>

      <NewsForm existing={editing} onSave={() => { setEditing(null); loadNews(); }} />

      <hr className="my-6" />

      <NewsList news={news} onEdit={setEditing} refresh={loadNews} />
    </div>
  );
}
