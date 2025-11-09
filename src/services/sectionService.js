// src/services/sectionService.js
// TEMPORAL — Usa mock data. Luego se reemplazará por Supabase.

import { sections } from "../data/sections";
import { mockDelay } from "../lib/mockApi";

export async function getSections() {
  await mockDelay();
  return [...sections];
}

export async function createSection(data) {
  await mockDelay();
  const newItem = { id: Date.now().toString(), ...data };
  sections.push(newItem);
  return newItem;
}

export async function updateSection(id, data) {
  await mockDelay();
  const index = sections.findIndex((s) => s.id === id);
  if (index === -1) return null;
  sections[index] = { ...sections[index], ...data };
  return sections[index];
}

export async function deleteSection(id) {
  await mockDelay();
  const index = sections.findIndex((s) => s.id === id);
  if (index >= 0) sections.splice(index, 1);
}
