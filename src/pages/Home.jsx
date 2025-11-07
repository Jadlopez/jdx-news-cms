//src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { getAllNews } from "../services/newsService";
import { Link } from "react-router-dom";

export default function Home() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    getAllNews("Publicado").then(setNews);
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6 text-jdx-dark">Noticias Publicadas</h1>

      {news.length === 0 ? (
        <p className="text-center text-gray-500">No hay noticias publicadas aún.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {news.map((n) => (
            <Link
              key={n.id}
              to={`/news/${n.id}`}
              className="bg-white shadow rounded-xl overflow-hidden hover:shadow-lg transition"
            >
              {n.imageUrl && (
                <img src={n.imageUrl} alt={n.title} className="w-full h-48 object-cover" />
              )}
              <div className="p-4">
                <h2 className="font-semibold text-lg mb-2">{n.title}</h2>
                <p className="text-sm text-gray-600 line-clamp-3">{n.content}</p>
                <div className="text-xs text-gray-400 mt-2">{n.author}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
