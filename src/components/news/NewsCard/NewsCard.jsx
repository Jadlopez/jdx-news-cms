// src/components/news/NewsCard/NewsCard.jsx
import React from "react";
import PropTypes from "prop-types";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import "./NewsCard.css";

export default function NewsCard({ item, onEdit, onDelete, onChangeStatus }) {
  const navigate = useNavigate();

  const title = item.title ?? item.titulo ?? "";
  const subtitle = item.subtitle ?? item.subtitulo ?? "";
  const imageUrl = item.imageUrl ?? item.imageURL ?? item.image ?? item.image_url ?? null;
  const author = item.author ?? item.autor ?? "Anónimo";
  const category = item.category ?? item.categoria ?? "";
  const status = (item.status ?? item.estado ?? "Edición").toString();
  const createdAt = item.createdAt ?? item.created_at ?? null;

  const createdLabel = createdAt ? format(new Date(createdAt), "PPP p") : "";

  const id = item.id ?? item._id ?? item.uid ?? null;

  const handleCardClick = () => {
    if (!id) return;
    navigate(`/noticia/${id}`);
  };

  const stop = (e) => {
    e.stopPropagation();
  };

  return (
    <article
      className="jdx-news-card"
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleCardClick();
      }}
      aria-label={`Abrir noticia ${title}`}
    >
      {imageUrl ? (
        <div className="jdx-news-media">
          <img src={imageUrl} alt={title} className="jdx-news-img" />
        </div>
      ) : (
        <div className="jdx-news-media jdx-news-media--placeholder" aria-hidden="true">
          <div className="jdx-news-thumb-placeholder">Sin imagen</div>
        </div>
      )}

      <div className="jdx-news-body">
        <div className="jdx-news-meta">
          {category && <span className="jdx-news-category">{category}</span>}
          <time className="jdx-news-date" dateTime={createdAt || ""}>{createdLabel}</time>
        </div>

        <h3 className="jdx-news-title">{title}</h3>
        {subtitle && <p className="jdx-news-sub">{subtitle}</p>}

        <div className="jdx-news-footer">
          <div className="jdx-news-author">Por {author}</div>
          <div className={`jdx-news-status jdx-news-status--${status.replace(/\s+/g, "-").toLowerCase()}`}>
            {status}
          </div>
        </div>

        <div className="jdx-news-actions" aria-label="Acciones de la noticia">
          {typeof onEdit === "function" && (
            <button className="jdx-btn jdx-btn-sm" onClick={(e) => { stop(e); onEdit(item); }}>
              Editar
            </button>
          )}

          {typeof onChangeStatus === "function" && (
            <>
              <button
                className="jdx-btn jdx-btn-sm jdx-btn-accept"
                onClick={(e) => { stop(e); onChangeStatus(id, "Publicado"); }}
                title="Publicar noticia"
              >
                Publicar
              </button>

              <button
                className="jdx-btn jdx-btn-sm jdx-btn-warn"
                onClick={(e) => { stop(e); onChangeStatus(id, "Desactivado"); }}
                title="Desactivar noticia"
              >
                Desactivar
              </button>
            </>
          )}

          {typeof onDelete === "function" && (
            <button
              className="jdx-btn jdx-btn-sm jdx-btn-danger"
              onClick={(e) => {
                stop(e);
                if (confirm("¿Eliminar esta noticia? Esta acción no se puede deshacer.")) {
                  onDelete(id, item.imagePath ?? item.image_path ?? null);
                }
              }}
            >
              Eliminar
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

NewsCard.propTypes = {
  item: PropTypes.object.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onChangeStatus: PropTypes.func,
};