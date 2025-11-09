// src/data/news.js
// TEMPORAL — Datos falsos para desarrollo. Se eliminará cuando haya API real.

export const news = [
  {
    id: "1",
    title: "Noticia de ejemplo",
    subtitle: "Subtítulo elegante",
    content:
      "Esta es una noticia falsa usada solo para pruebas de interfaz.",
    imageUrl: "https://via.placeholder.com/600x300",
    author: "Admin",
    category: "General",
    status: "Publicado", // Publicado | Edición | Desactivado
    createdAt: "2025-02-01",
  },
  {
    id: "2",
    title: "Avance del proyecto",
    subtitle: "CMS en progreso",
    content:
      "Esta noticia demuestra el sistema de mock antes de conectarse al backend real.",
    imageUrl: "https://via.placeholder.com/600x300",
    author: "Reportero 1",
    category: "Actualidad",
    status: "Edición",
    createdAt: "2025-02-02",
  },
];
