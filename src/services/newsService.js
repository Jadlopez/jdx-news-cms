// src/services/newsService.js
import { supabase } from "../supabase/client.js";

/** Subida de imagen a Supabase Storage */
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

/** Mapear fila de noticia */
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
    author: row.users?.name || row.users?.email || "Anónimo", // 👈 nombre del autor
    authorId: row.author, // uuid del autor
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Crear noticia */
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
    author: user.id, // 👈 ahora guarda el id del usuario
    status: data.status || "Edición",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data: news, error } = await supabase
    .from("news")
    .insert([payload])
    .select("*, users(name, email)") // 👈 join para obtener nombre/email
    .single();

  if (error) throw error;
  return mapNewsRow(news);
}

/** Obtener todas las noticias */
export async function getAllNews(status = null) {
  let query = supabase
    .from("news")
    .select("*, users(name, email)") // 👈 join con users
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  return Array.isArray(data) ? data.map(mapNewsRow) : [];
}

/** Obtener noticia por ID */
export async function getNewsById(id) {
  const { data, error } = await supabase
    .from("news")
    .select("*, users(name, email)") // 👈 join también aquí
    .eq("id", id)
    .single();

  if (error) throw error;
  return mapNewsRow(data);
}

/** Actualizar noticia */
export async function updateNews(id, data) {
  const payload = {
    title: data.title,
    subtitle: data.subtitle,
    content: data.content,
    category: data.category,
    image_url: data.imageUrl,
    image_path: data.imagePath,
    author: data.authorId, // 👈 uuid del autor
    status: data.status,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("news").update(payload).eq("id", id);
  if (error) throw error;
}

/** Cambiar estado */
export async function updateNewsStatus(id, status) {
  const { error } = await supabase
    .from("news")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

/** Eliminar noticia + imagen */
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

/** Noticias de un autor */
export async function getNewsByAuthor(authorId, status = null) {
  let query = supabase
    .from("news")
    .select("*, users(name, email)") // 👈 también aquí
    .eq("author", authorId)
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  return Array.isArray(data) ? data.map(mapNewsRow) : [];
}
