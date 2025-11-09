// src/components/sections/SectionList/SectionList.jsx
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllSections, deleteSection } from "../../../services/sectionService";
import toast from "react-hot-toast";
import "./SectionList.css";

/**
 * SectionList
 * - Lista de secciones con acciones (editar, eliminar)
 * - onEdit(section) callback para editar
 */
export default function SectionList({ onEdit = null }) {
  const qc = useQueryClient();
  const { data: sections = [], isLoading, isError } = useQuery(["sections"], getAllSections, {
    staleTime: 1000 * 60 * 2,
  });

  const deleteMut = useMutation(({ id }) => deleteSection(id), {
    onSuccess: () => {
      qc.invalidateQueries(["sections"]);
      toast.success("Sección eliminada");
    },
    onError: (err) => {
      console.error("deleteSection error", err);
      toast.error("No se pudo eliminar la sección");
    },
  });

  const handleDelete = (s) => {
    if (!confirm(`Eliminar sección "${s.name}"? Esta acción no se puede deshacer.`)) return;
    deleteMut.mutate({ id: s.id });
  };

  if (isLoading) return <div className="text-muted">Cargando secciones...</div>;
  if (isError) return <div className="text-danger">Error cargando secciones.</div>;

  if (!sections.length) {
    return <div className="text-muted">No hay secciones registradas.</div>;
  }

  return (
    <ul className="jdx-section-list grid md:grid-cols-2 gap-4">
      {sections.map((s) => (
        <li key={s.id} className="jdx-section-item bg-white p-4 rounded-xl shadow-sm">
          <div className="jdx-section-row">
            <div>
              <h3 className="jdx-section-name">{s.name}</h3>
              {s.description && <p className="jdx-section-desc text-sm text-muted">{s.description}</p>}
            </div>

            <div className="jdx-section-actions">
              {typeof onEdit === "function" && (
                <button className="jdx-btn" onClick={() => onEdit(s)}>Editar</button>
              )}
              <button className="jdx-btn jdx-btn-danger" onClick={() => handleDelete(s)}>Eliminar</button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}