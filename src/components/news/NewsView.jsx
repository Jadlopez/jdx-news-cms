import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getNewsById } from "../../services/newsService";

export default function NewsView() {
  const { id } = useParams();
  const [news, setNews] = useState(null);

  useEffect(() => {
    getNewsById(id).then(setNews);
  }, [id]);

  if (!news) return <div>Cargando noticia...</div>;

  return (
    <article style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
      <h1>{news.title}</h1>
      {news.imageUrl && <img src={news.imageUrl} alt={news.title} style={{ width: "100%", borderRadius: 8 }} />}
      <p style={{ marginTop: 20 }}>{news.content}</p>
      <small>Publicado por: {news.author}</small>
    </article>
  );
}
