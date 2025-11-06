// src/components/news/NewsForm.jsx
import React, { useState } from "react";
import { uploadImage, createNews, updateNews } from "../../services/newsService";
import { useAuth } from "../../contexts/AuthContext";

export default function NewsForm({ existing = null, onSave }) {
  const [title, setTitle] = useState(existing?.title || "");
  const [subtitle, setSubtitle] = useState(existing?.subtitle || "");
  const [category, setCategory] = useState(existing?.category || "General");
  const [content, setContent] = useState(existing?.content || "");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(existing?.imageUrl || "");
  const [loading, setLoading] = useState(false);
  const { user, userData } = useAuth();

  // Un reportero no puede setear estado a 'Publicado' — sólo a 'Edición' o 'Terminado'
  const canSetStatus = userData?.role === "editor";
  const [status, setStatus] = useState(existing?.status || "Edición");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = existing?.imageUrl || "";
      let imagePath = existing?.imagePath || "";

      if (imageFile) {
        const uploaded = await uploadImage(imageFile);
        if (uploaded) {
          imageUrl = uploaded.url;
          imagePath = uploaded.path;
        }
      }

      const data = {
        title,
        subtitle,
        content,
        category,
        imageUrl,
        imagePath,
        author: user?.email,
        status: status // el rol y políticas las controla el backend/frontend (PrivateRoute)
      };

      if (existing) {
        await updateNews(existing.id, data);
      } else {
        await createNews(data);
      }

      onSave?.();
      // limpiar formulario si es nuevo
      if (!existing) {
        setTitle("");
        setSubtitle("");
        setContent("");
        setImageFile(null);
        setPreview("");
        setCategory("General");
        setStatus("Edición");
      }
    } catch (err) {
      console.error("Error guardando noticia:", err);
      alert("Error al guardar noticia");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="news-form p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-3">{existing ? "Editar noticia" : "Nueva noticia"}</h2>

      <input
        type="text"
        placeholder="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="w-full p-2 border rounded mb-2"
      />

      <input
        type="text"
        placeholder="Subtítulo (bajante)"
        value={subtitle}
        onChange={(e) => setSubtitle(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />

      <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 border rounded mb-2">
        <option>General</option>
        <option>Tecnología</option>
        <option>Política</option>
        <option>Deportes</option>
        <option>Cultura</option>
      </select>

      <textarea
        placeholder="Contenido"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        className="w-full p-2 border rounded mb-2 min-h-[160px]"
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const f = e.target.files[0];
          setImageFile(f);
          if (f) setPreview(URL.createObjectURL(f));
        }}
        className="mb-2"
      />

      {preview && <img src={preview} alt="preview" className="w-full rounded mb-2" />}

      <div className="flex gap-2 items-center">
        <button
          disabled={loading}
          className="px-4 py-2 rounded bg-teal-500 text-white hover:bg-teal-600"
        >
          {loading ? "Guardando..." : existing ? "Actualizar" : "Guardar"}
        </button>

        <select value={status} onChange={(e) => setStatus(e.target.value)} className="p-2 border rounded">
          {/* un reportero sólo podrá poner Edición o Terminado si no es editor */}
          <option>Edición</option>
          <option>Terminado</option>
          {canSetStatus && <option>Publicado</option>}
          {canSetStatus && <option>Desactivado</option>}
        </select>
      </div>
    </form>
  );
}
