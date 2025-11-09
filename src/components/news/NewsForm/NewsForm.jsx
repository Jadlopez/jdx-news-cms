// src/components/news/NewsForm/NewsForm.jsx
import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  uploadImage,
  createNews,
  updateNews,
  deleteImage,
} from "../../../services/newsService";
import { useAuth } from "../../../contexts/AuthContext";

const schema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  subtitle: z.string().optional(),
  content: z.string().min(1, "El contenido es obligatorio"),
  category: z.string().optional(),
  status: z.string().optional(),
});

export default function NewsForm({ existing = null, onSaved = null }) {
  const { user, userData } = useAuth();
  const qc = useQueryClient();
  const mounted = useRef(true);

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing]);

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

  const createMut = useMutation((payload) => createNews(payload), {
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
    const payloadBase = {
      title: data.title,
      subtitle: data.subtitle ?? "",
      content: data.content,
      category: data.category ?? "",
      status: data.status ?? "Edición",
      author: user?.id ?? user?.email ?? "Anónimo",
      updatedAt: new Date().toISOString(),
    };

    let imageUrl = existing?.imageUrl ?? existing?.imageURL ?? "";
    let imagePath = existing?.imagePath ?? existing?.image_path ?? "";

    if (imageFile) {
      // try delete old image
      if (imagePath) {
        try {
          await deleteImage(imagePath);
        } catch (err) {
          console.warn("No se pudo borrar la imagen anterior:", err);
        }
      }

      const uploaded = await uploadImage(imageFile);
      if (!uploaded || !uploaded.url)
        throw new Error("Error al subir la imagen");
      imageUrl = uploaded.url;
      imagePath =
        uploaded.path ?? uploaded.fullPath ?? uploaded.storagePath ?? "";
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
      await createMut.mutateAsync({
        ...payload,
        createdAt: new Date().toISOString(),
      });
      reset();
      setImageFile(null);
      setPreview(null);
    }
  };

  const onSubmit = async (formData) => {
    const role = userData?.role ?? null;
    if (
      ["Publicado", "Desactivado"].includes(formData.status) &&
      role !== "editor"
    ) {
      toast.error("No tienes permisos para asignar ese estado.");
      return;
    }

    const t = toast.loading("Guardando noticia...");
    try {
      await performSave(formData);
      toast.success("Guardado", { id: t });
    } catch (err) {
      toast.error("Error al guardar noticia", { id: t });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 bg-white p-4 rounded-2xl shadow-md"
    >
      <h2 className="text-lg font-semibold text-jdx-dark">
        {existing ? "Editar Noticia" : "Nueva Noticia"}
      </h2>

      <div>
        <label className="block text-sm font-medium mb-1">Título</label>
        <input
          type="text"
          className="w-full p-2 border rounded-lg"
          {...register("title")}
        />
        {errors.title && (
          <p className="text-red-600 text-sm">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Bajada / Subtítulo
        </label>
        <input
          type="text"
          className="w-full p-2 border rounded-lg"
          {...register("subtitle")}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Contenido</label>
        <textarea
          className="w-full p-2 border rounded-lg h-32"
          {...register("content")}
        />
        {errors.content && (
          <p className="text-red-600 text-sm">{errors.content.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Imagen</label>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="mt-2 w-40 h-40 object-cover rounded-lg"
          />
        )}
      </div>

      <div className="jdx-form-section">
        <label className="jdx-label">Categoría</label>
        <input
          className="jdx-input"
          {...register("category")}
          disabled={isSubmitting}
        />

        <label className="jdx-label">Estado</label>
        <select
          className="jdx-select"
          {...register("status")}
          disabled={isSubmitting || userData?.role !== "editor"}
        >
          <option value="Edición">Edición</option>
          <option value="Terminado">Terminado</option>
          <option value="Publicado">Publicado</option>
          <option value="Desactivado">Desactivado</option>
        </select>
      </div>

      <div className="jdx-form-actions">
        <button
          type="submit"
          className="jdx-btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Guardando..."
            : existing
            ? "Actualizar"
            : "Crear noticia"}
        </button>
        <button
          type="button"
          className="jdx-btn-secondary"
          onClick={() => {
            reset();
            setImageFile(null);
            setPreview(existing?.imageUrl ?? null);
          }}
          disabled={isSubmitting}
        >
          Restablecer
        </button>
      </div>
    </form>
  );
}
