//src/pages/Sections.jsx
import React, { useEffect, useState } from "react";
import { getAllSections } from "../../services/sectionService";

export default function Sections() {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    getAllSections().then(setSections);
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-jdx-dark">Secciones del Periódico</h1>
      {sections.length === 0 ? (
        <p className="text-gray-500">No hay secciones registradas.</p>
      ) : (
        <ul className="grid md:grid-cols-2 gap-4">
          {sections.map((s) => (
            <li key={s.id} className="bg-white p-4 shadow rounded-xl">
              <h2 className="font-semibold text-lg">{s.name}</h2>
              <p className="text-sm text-gray-600">{s.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
