// src/services/newsService.js
// TEMPORAL — Usa mock data. Luego se reemplazará por Supabase.

import { news } from "../data/news";
import { mockDelay } from "../lib/mockApi";

export async function getAllNews() {
  await mockDelay();
  return [...news].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function getNewsById(id) {
  await mockDelay();
  return news.find((n) => n.id === id) || null;
}

export async function createNews(data) {
  await mockDelay();
  const newItem = { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() };
  news.push(newItem);
  return newItem;
}

export async function updateNews(id, data) {
  await mockDelay();
  const index = news.findIndex((n) => n.id === id);
  if (index === -1) return null;
  news[index] = { ...news[index], ...data };
  return news[index];
}

export async function deleteNews(id) {
  await mockDelay();
  const index = news.findIndex((n) => n.id === id);
  if (index >= 0) news.splice(index, 1);
}
