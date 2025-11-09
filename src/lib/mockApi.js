// src/lib/mockApi.js
// TEMPORAL — Simula llamadas HTTP con retraso para dar realismo

export const mockDelay = (ms = 400) =>
  new Promise((resolve) => setTimeout(resolve, ms));
