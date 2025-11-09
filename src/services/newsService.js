// src/services/newsService.js
import { supabase } from "../supabase/client.js";

/**
 * Upload an image to Supabase storage and return public URL and path
 */
export async function uploadImage(file, folder = "news") {
  if (!file) return null;
  const filename = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
  const path = `${folder}/${filename}`;

  const { error: uploadError } = await supabase.storage
    .from("news-images")
    .upload(path, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("news-images").getPublicUrl(path);
  return { url: data.publicUrl, path };
}

function mapNewsRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    content: row.content,
    category: row.category,
    imageUrl: row.image_url || "",
    imagePath: row.image_path || "",
    author: row.author,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createNews(data) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error("Debes iniciar sesión para crear noticias");

  const payload = {
    title: data.title || "",
    subtitle: data.subtitle || "",
    content: data.content || "",
    category: data.category || "General",
    image_url: data.imageUrl || "",
    image_path: data.imagePath || "",
    author: user.id,
    status: data.status || "Edición",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data: news, error } = await supabase
    .from("news")
    .insert([payload])
    .select()
    .single();
  if (error) throw error;
  return mapNewsRow(news);
}

export async function getAllNews(status = null) {
  let query = supabase
    .from("news")
    .select("*")
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  return Array.isArray(data) ? data.map(mapNewsRow) : [];
}

export async function getNewsById(id) {
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return mapNewsRow(data);
}

export async function updateNews(id, data) {
  const payload = {
    title: data.title,
    subtitle: data.subtitle,
    content: data.content,
    category: data.category,
    image_url: data.imageUrl,
    image_path: data.imagePath,
    author: data.author,
    status: data.status,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("news").update(payload).eq("id", id);
  if (error) throw error;
}

export async function updateNewsStatus(id, status) {
  const { error } = await supabase
    .from("news")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteNews(id, imagePath) {
  if (imagePath) {
    const { error: storageError } = await supabase.storage
      .from("news-images")
      .remove([imagePath]);
    if (storageError) console.warn("Error eliminando imagen:", storageError);
  }
  const { error } = await supabase.from("news").delete().eq("id", id);
  if (error) throw error;
}

export async function deleteImage(path) {
  if (!path) return;
  const { error } = await supabase.storage.from("news-images").remove([path]);
  if (error) throw error;
}

export async function getNewsByAuthor(authorId, status = null) {
  let query = supabase
    .from("news")
    .select("*")
    .eq("author", authorId)
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  return Array.isArray(data) ? data.map(mapNewsRow) : [];
}
