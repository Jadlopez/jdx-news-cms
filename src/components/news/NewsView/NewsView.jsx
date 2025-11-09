// src/components/news/NewsView/NewsView.jsx
import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getNewsById } from "../../../services/newsService";
import formatDate from "../../../utils/formatDate";
import "./NewsView.css";

/**
 * NewsView
 * - Muestra una noticia individual (/noticia/:id o /news/:id según rutas)
 * - Usa react-query para caching / loading / error
 * - Conserva CSS existente y añade clases semánticas
 */
export default function NewsView() {
  const { id } = useParams();

  const { data: news, isLoading, isError, error } = useQuery(
    ["news", id],
    () => getNewsById(id),
    {
      enabled: !!id,
      staleTime: 1000 * 60 * 2, // 2 minutos
    }
  );

  if (isLoading) {
    return (
      <div className="jdx-newsview-loading">
        <div className="spinner" aria-hidden="true" />
        <p className="text-muted">Cargando noticia...</p>
      </div>
    );
  }

  if (isError || !news) {
    return (
      <div className="jdx-newsview-error p-6 max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold">Noticia no encontrada</h2>
        <p className="text-sm text-muted">{error?.message ?? "No se pudo cargar la noticia."}</p>
        <Link to="/" className="jdx-link mt-4">Volver al inicio</Link>
      </div>
    );
  }

  const title = news.title ?? news.titulo;
  const content = news.content ?? news.contenido ?? news.body;
  const author = news.author ?? news.autor ?? "Anónimo";
  const imageUrl = news.imageUrl ?? news.imageURL ?? news.image;
  const category = news.category ?? news.categoria ?? "";
  const status = news.status ?? news.estado ?? "";
  const createdAt = news.createdAt ?? news.created_at ?? news.createdAt;

  return (
    <article className="jdx-newsview max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-md">
      <header className="jdx-newsview-header mb-4">
        {category && <span className="jdx-newsview-category">{category}</span>}
        <h1 className="jdx-newsview-title">{title}</h1>
        <div className="jdx-newsview-meta">
          <span className="jdx-newsview-author">Por {author}</span>
          {createdAt && <time className="jdx-newsview-date"> • {formatDate(createdAt)}</time>}
          {status && <span className={`jdx-newsview-badge status-${String(status).toLowerCase()}`}>{status}</span>}
        </div>
      </header>

      {imageUrl && (
        <div className="jdx-newsview-media mb-4">
          <img src={imageUrl} alt={title} className="jdx-newsview-img" />
        </div>
      )}

      <section className="jdx-newsview-content prose max-w-none">
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </section>

      <footer className="jdx-newsview-footer mt-6 text-sm text-muted">
        <div>Publicado por: <strong>{author}</strong></div>
        {createdAt && <div>Publicado: {formatDate(createdAt, true)}</div>}
      </footer>
    </article>
  );
}