// src/components/news/NewsList/NewsList.jsx
import React, { useMemo, useState } from "react";
import { deleteNews, updateNewsStatus } from "../../../services/newsService";
import { useAuth } from "../../../contexts/AuthContext";

export default function NewsList({
  news = [],
  onEdit,
  onReload,
  pageSize = 6,
}) {
  const { userData } = useAuth();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  // filtro por query (title, subtitle, content, author, category)
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return news;
    return news.filter((n) => {
      return (
        (n.title || "").toLowerCase().includes(query) ||
        (n.subtitle || "").toLowerCase().includes(query) ||
        (n.content || "").toLowerCase().includes(query) ||
        (n.author || "").toLowerCase().includes(query) ||
        (n.category || "").toLowerCase().includes(query)
      );
    });
  }, [news, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const slice = filtered.slice((page - 1) * pageSize, page * pageSize);

  async function handleDelete(id, imagePath) {
    if (!confirm("Eliminar noticia?")) return;
    await deleteNews(id, imagePath);
    if (onReload) onReload();
  }

  async function handleChangeStatus(id, newStatus) {
    await updateNewsStatus(id, newStatus);
    if (onReload) onReload();
  }

  const isEditor = userData?.role === "editor";
  const isReporter = userData?.role === "reportero";

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="Buscar por título, autor o categoría..."
          className="flex-1 p-2 border rounded"
        />
      </div>

      {slice.length === 0 ? (
        <p className="text-sm text-slate-500">No hay resultados.</p>
      ) : (
        <ul className="grid md:grid-cols-2 gap-4">
          {slice.map((n) => (
            <li key={n.id} className="bg-white rounded shadow p-3">
              <div className="flex gap-4">
                {n.imageUrl && (
                  <img
                    src={n.imageUrl}
                    alt={n.title}
                    className="w-28 h-20 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">{n.title}</h3>
                  <p className="text-sm text-slate-600">{n.subtitle}</p>
                  <div className="text-xs text-slate-500 mt-1">
                    {n.category} • {n.author} •{" "}
                    <span className="italic">{n.status}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => onEdit(n)}
                  className="px-3 py-1 border rounded text-sm"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(n.id, n.imagePath)}
                  className="px-3 py-1 rounded text-sm bg-red-500 text-white"
                >
                  Eliminar
                </button>

                {isEditor && (
                  <>
                    <button
                      onClick={() => handleChangeStatus(n.id, "Publicado")}
                      className="px-3 py-1 rounded text-sm bg-green-600 text-white"
                    >
                      Publicar
                    </button>
                    <button
                      onClick={() => handleChangeStatus(n.id, "Desactivado")}
                      className="px-3 py-1 rounded text-sm bg-yellow-500 text-white"
                    >
                      Desactivar
                    </button>
                  </>
                )}

                {isReporter && n.status !== "Publicado" && (
                  <button
                    onClick={() => handleChangeStatus(n.id, "Terminado")}
                    className="px-3 py-1 rounded text-sm bg-sky-500 text-white"
                  >
                    Marcar Terminado
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* paginación simple */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-slate-600">
          Página {page} de {totalPages}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded"
          >
            Anterior
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
