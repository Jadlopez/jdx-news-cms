// src/components/news/NewsForm/NewsForm.jsx
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import {
  uploadImage,
  createNews,
  updateNews,
  deleteImage,
} from "../../../services/newsService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import "./NewsForm.css";

/**
 * NewsForm (mejorada)
 * - usa react-hook-form + zod para validación
 * - usa react-query para mutaciones y refresco de listas
 * - soporta subida de imagen con progreso (si uploadImage acepta callback)
 *
 * Props:
 * - existing: noticia existente (para editar)
 * - onSaved: callback cuando se guarda correctamente (ej. recargar lista)
 */
const schema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  subtitle: z.string().optional(),
  content: z.string().min(1, "El contenido es obligatorio"),
  category: z.string().optional(),
  status: z.enum(["Edición", "Terminado", "Publicado", "Desactivado"]),
});

export default function NewsForm({ existing = null, onSaved = null }) {
  const { user, userData } = useAuth();
  const qc = useQueryClient();
  const mounted = useRef(true);

  useEffect(() => () => { mounted.current = false; }, []);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      subtitle: "",
      content: "",
      category: "",
      status: "Edición",
    },
  });

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Sync with existing prop
  useEffect(() => {
    if (existing) {
      setValue("title", existing.title ?? existing.titulo ?? "");
      setValue("subtitle", existing.subtitle ?? existing.subtitulo ?? "");
      setValue("content", existing.content ?? "");
      setValue("category", existing.category ?? existing.categoria ?? "");
      setValue("status", existing.status ?? existing.estado ?? "Edición");
      setPreview(existing.imageUrl ?? existing.imageURL ?? null);
    } else {
      reset();
      setImageFile(null);
      setPreview(null);
      setUploadProgress(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing, setValue, reset]);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleImageChange = (e) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Selecciona un archivo de imagen válido.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("La imagen no debe superar 5 MB.");
      return;
    }
    setImageFile(f);
    setPreview(URL.createObjectURL(f));
  };

  // Mutations
  const createMut = useMutation(createNews, {
    onSuccess: () => {
      qc.invalidateQueries(["news"]);
      toast.success("Noticia creada correctamente");
      if (typeof onSaved === "function") onSaved();
    },
    onError: (err) => {
      console.error("createNews error", err);
      toast.error("No se pudo crear la noticia");
    },
  });

  const updateMut = useMutation(({ id, payload }) => updateNews(id, payload), {
    onSuccess: () => {
      qc.invalidateQueries(["news"]);
      toast.success("Noticia actualizada correctamente");
      if (typeof onSaved === "function") onSaved();
    },
    onError: (err) => {
      console.error("updateNews error", err);
      toast.error("No se pudo actualizar la noticia");
    },
  });

  const performSave = async (data) => {
    // prepare payload
    const payloadBase = {
      title: data.title,
      subtitle: data.subtitle ?? "",
      content: data.content,
      category: data.category ?? "",
      status: data.status,
      author: user?.email ?? user?.user?.email ?? "Anónimo",
      updatedAt: new Date().toISOString(),
    };

    let imageUrl = existing?.imageUrl ?? existing?.imageURL ?? "";
    let imagePath = existing?.imagePath ?? existing?.image_path ?? "";

    try {
      // handle image upload if a new file was selected
      if (imageFile) {
        // delete old image if exists
        if (imagePath) {
          try {
            await deleteImage(imagePath);
          } catch (err) {
            console.warn("No se pudo borrar la imagen anterior:", err);
          }
        }

        // uploadImage(file, onProgress?) -> { url, path }
        const uploaded = await uploadImage(imageFile, (p) => {
          if (mounted.current) setUploadProgress(Math.round(p));
        });

        if (!uploaded || !uploaded.url) throw new Error("Error al subir la imagen");
        imageUrl = uploaded.url;
        imagePath = uploaded.path ?? uploaded.fullPath ?? uploaded.storagePath ?? "";
      }

      const payload = {
        ...payloadBase,
        imageUrl,
        imagePath,
      };

      if (existing?.id || existing?.uid) {
        const id = existing.id ?? existing.uid;
        await updateMut.mutateAsync({ id, payload });
      } else {
        await createMut.mutateAsync({ ...payload, createdAt: new Date().toISOString() });
        // reset form for new entry
        reset();
        setImageFile(null);
        setPreview(null);
        setUploadProgress(0);
      }
    } catch (err) {
      console.error("performSave error:", err);
      throw err;
    }
  };

  const onSubmit = async (formData) => {
    // role checks: only editors may set "Publicado" or "Desactivado"
    const role = userData?.role ?? null;
    if (["Publicado", "Desactivado"].includes(formData.status) && role !== "editor") {
      toast.error("No tienes permisos para asignar ese estado.");
      return;
    }

    toast.dismiss();
    const t = toast.loading("Guardando noticia...");
    try {
      await performSave(formData);
      toast.success("Guardado", { id: t });
    } catch (err) {
      toast.error("Error al guardar noticia", { id: t });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="jdx-news-form">
      <div className="jdx-news-form-grid">
        <div className="jdx-news-form-main">
          <label className="jdx-label">Título</label>
          <input className="jdx-input" {...register("title")} disabled={isSubmitting} />
          {errors.title && <p className="jdx-field-error">{errors.title.message}</p>}

          <label className="jdx-label">Bajante / Subtítulo</label>
          <input className="jdx-input" {...register("subtitle")} disabled={isSubmitting} />

          <label className="jdx-label">Contenido</label>
          <textarea rows="8" className="jdx-textarea" {...register("content")} disabled={isSubmitting} />
          {errors.content && <p className="jdx-field-error">{errors.content.message}</p>}
        </div>

        <aside className="jdx-news-form-aside">
          <div className="jdx-form-section">
            <label className="jdx-label">Imagen</label>
            <input type="file" accept="image/*" onChange={handleImageChange} disabled={isSubmitting} />
            {preview && <img src={preview} alt="Preview" className="jdx-image-preview" />}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="jdx-progress">
                <div className="jdx-progress-bar" style={{ width: `${uploadProgress}%` }} />
                <small>{uploadProgress}%</small>
              </div>
            )}
          </div>

          <div className="jdx-form-section">
            <label className="jdx-label">Categoría</label>
            <input className="jdx-input" {...register("category")} disabled={isSubmitting} />

            <label className="jdx-label">Estado</label>
            <select className="jdx-select" {...register("status")} disabled={isSubmitting || userData?.role !== "editor"}>
              <option value="Edición">Edición</option>
              <option value="Terminado">Terminado</option>
              <option value="Publicado">Publicado</option>
              <option value="Desactivado">Desactivado</option>
            </select>
          </div>

          <div className="jdx-form-actions">
            <button type="submit" className="jdx-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : existing ? "Actualizar" : "Crear noticia"}
            </button>
            <button
              type="button"
              className="jdx-btn-secondary"
              onClick={() => {
                reset();
                setImageFile(null);
                setPreview(existing?.imageUrl ?? null);
                setUploadProgress(0);
              }}
              disabled={isSubmitting}
            >
              Restablecer
            </button>
          </div>
        </aside>
      </div>
    </form>
  );
}