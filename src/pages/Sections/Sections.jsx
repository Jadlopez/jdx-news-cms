//src/pages/Sections/Sections.jsx
import React, { useState } from "react";
import SectionList from "../../components/sections/SectionList/SectionList";
import SectionForm from "../../components/sections/SectionForm/SectionForm";

/**
 * Sections page
 * - Combina la lista de secciones y el formulario de creación/edición
 */
export default function Sections() {
  const [editing, setEditing] = useState(null);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-jdx-dark">Secciones del Periódico</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <SectionForm existing={editing} onSaved={() => setEditing(null)} onCancel={() => setEditing(null)} />
        </div>

        <div>
          <SectionList onEdit={(s) => setEditing(s)} />
        </div>
      </div>
    </div>
  );
}