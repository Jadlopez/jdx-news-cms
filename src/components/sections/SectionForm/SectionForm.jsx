//crs/components/sections/SectionForm/SectionForm.jsx
import React, { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createSection, updateSection } from "../../../services/sectionService";
import "./SectionForm.css";

/**
 * SectionForm
 * - existing: objeto sección para editar (opcional)
 * - onSaved: callback cuando se guarda
 * - onCancel: cancelar edición (opcional)
 *
 * Usa react-hook-form + zod y react-query
 */

const schema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  slug: z.string().optional(),
});

export default function SectionForm({ existing = null, onSaved = null, onCancel = null }) {
  const qc = useQueryClient();
  const mounted = useRef(true);
  useEffect(() => () => { mounted.current = false; }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "", slug: "" },
  });

  useEffect(() => {
    if (existing) {
      setValue("name", existing.name ?? "");
      setValue("description", existing.description ?? "");
      setValue("slug", existing.slug ?? "");
    } else {
      reset();
    }
  }, [existing, setValue, reset]);

  const createMut = useMutation((payload) => createSection(payload), {
    onSuccess: () => {
      qc.invalidateQueries(["sections"]);
      toast.success("Sección creada");
      if (typeof onSaved === "function") onSaved();
    },
    onError: (err) => {
      console.error("createSection error", err);
      toast.error("No se pudo crear la sección");
    },
  });

  const updateMut = useMutation(({ id, payload }) => updateSection(id, payload), {
    onSuccess: () => {
      qc.invalidateQueries(["sections"]);
      toast.success("Sección actualizada");
      if (typeof onSaved === "function") onSaved();
    },
    onError: (err) => {
      console.error("updateSection error", err);
      toast.error("No se pudo actualizar la sección");
    },
  });

  const onSubmit = async (data) => {
    try {
      if (existing?.id) {
        await updateMut.mutateAsync({ id: existing.id, payload: data });
      } else {
        await createMut.mutateAsync(data);
        reset();
      }
    } catch (err) {
      // handled by onError
    }
  };

  return (
    <form className="jdx-section-form bg-white p-4 rounded-xl shadow-sm" onSubmit={handleSubmit(onSubmit)} noValidate>
      <h3 className="jdx-section-title">{existing ? "Editar sección" : "Crear sección"}</h3>

      <label className="jdx-label">Nombre</label>
      <input className="jdx-input" {...register("name")} disabled={isSubmitting} />
      {errors.name && <p className="jdx-field-error">{errors.name.message}</p>}

      <label className="jdx-label">Descripción</label>
      <textarea className="jdx-textarea" {...register("description")} disabled={isSubmitting} />

      <label className="jdx-label">Slug (opcional)</label>
      <input className="jdx-input" {...register("slug")} disabled={isSubmitting} />

      <div className="jdx-section-actions">
        <button type="submit" className="jdx-btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : existing ? "Actualizar" : "Crear"}
        </button>

        {typeof onCancel === "function" && (
          <button type="button" className="jdx-btn-secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}