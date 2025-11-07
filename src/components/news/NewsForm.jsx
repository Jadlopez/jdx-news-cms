// src/components/news/NewsForm.jsx
import React, { useEffect, useState } from "react";
import { uploadImage, createNews, updateNews, deleteImage } from "../../services/newsService";
import { useAuth } from "../../contexts/AuthContext";

const NewsForm = ({ existing, onSaved }) => {
  const { user, userData } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("Edición");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  //  Sincroniza cuando cambia "existing"
  useEffect(() => {
    if (existing) {
      setTitle(existing.title || "");
      setContent(existing.content || "");
      setStatus(existing.status || "Edición");
      setPreview(existing.imageUrl || null);
    } else {
      setTitle("");
      setContent("");
      setStatus("Edición");
      setPreview(null);
      setImageFile(null);
    }
  }, [existing]);

  // ✅ Limpia objectURL cuando cambia imagen o se desmonta
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen no debe superar 5 MB.");
        return;
      }
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    } else {
      alert("Selecciona un archivo de imagen válido.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      alert("Título y contenido son obligatorios.");
      return;
    }

    setSaving(true);
    try {
      let imageUrl = existing?.imageUrl || "";
      let imagePath = existing?.imagePath || "";

      // ✅ Si hay nueva imagen, sube y borra la anterior
      if (imageFile) {
        if (imagePath) await deleteImage(imagePath);
        const uploaded = await uploadImage(imageFile);
        imageUrl = uploaded.url;
        imagePath = uploaded.path;
      }

      const newsData = {
        title,
        content,
        status,
        imageUrl,
        imagePath,
        author: user.email,
        updatedAt: new Date().toISOString(),
      };

      if (existing?.id) {
        await updateNews(existing.id, newsData);
        alert("Noticia actualizada correctamente.");
      } else {
        await createNews({ ...newsData, createdAt: new Date().toISOString() });
        alert("Noticia creada correctamente.");
      }

      if (onSaved) onSaved();
    } catch (error) {
      console.error("Error guardando noticia:", error);
      alert("No se pudo guardar la noticia. Inténtalo nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-2xl shadow-md">
      <h2 className="text-lg font-semibold text-jdx-dark">
        {existing ? "Editar Noticia" : "Nueva Noticia"}
      </h2>

      <input
        type="text"
        placeholder="Título"
        className="w-full p-2 border rounded-lg"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <textarea
        placeholder="Contenido"
        className="w-full p-2 border rounded-lg h-32"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />

      <div>
        <label className="block text-sm font-medium mb-1">Imagen:</label>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {preview && (
          <img src={preview} alt="Preview" className="mt-2 w-40 h-40 object-cover rounded-lg" />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Estado:</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="p-2 border rounded-lg"
          disabled={userData?.role !== "editor"}
        >
          <option value="Edición">Edición</option>
          <option value="Terminado">Terminado</option>
          <option value="Publicado">Publicado</option>
          <option value="Desactivado">Desactivado</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="bg-jdx-accent text-white px-4 py-2 rounded-xl hover:bg-jdx-dark transition"
      >
        {saving ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
};

export default NewsForm;
