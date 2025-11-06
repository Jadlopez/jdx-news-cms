// src/services/newsService.js
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where
} from "firebase/firestore";
import { db, storage } from "../firebase/firebaseConfig";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

/**
 * Sube una imagen y devuelve { url, path }
 * path: ruta relativa en el storage (ej: news/123_filename.jpg)
 */
export async function uploadImage(file, folder = "news") {
  if (!file) return null;
  const filename = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
  const path = `${folder}/${filename}`;
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);
  return { url, path };
}

/**
 * Crear noticia (incluye imageUrl e imagePath si aplica)
 */
export async function createNews(data) {
  const newsRef = collection(db, "news");
  // Asegurar campos mínimos y estado por defecto
  const payload = {
    title: data.title || "",
    subtitle: data.subtitle || "",
    content: data.content || "",
    category: data.category || "General",
    imageUrl: data.imageUrl || "",
    imagePath: data.imagePath || "", // para eliminar luego
    author: data.author || "",
    status: data.status || "Edición", // Edición | Terminado | Publicado | Desactivado
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  const docRef = await addDoc(newsRef, payload);
  return docRef.id;
}

/**
 * Obtener todas (o por status opcional)
 */
export async function getAllNews(status = null) {
  const newsRef = collection(db, "news");
  let q;
  if (status) {
    q = query(newsRef, where("status", "==", status), orderBy("createdAt", "desc"));
  } else {
    q = query(newsRef, orderBy("createdAt", "desc"));
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Obtener una noticia
 */
export async function getNewsById(id) {
  const docRef = doc(db, "news", id);
  const snap = await getDoc(docRef);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * Actualizar noticia (no borra la imagen anterior)
 */
export async function updateNews(id, data) {
  const docRef = doc(db, "news", id);
  const payload = {
    ...data,
    updatedAt: new Date().toISOString()
  };
  await updateDoc(docRef, payload);
}

/**
 * Actualizar sólo el estado (útil para el editor)
 */
export async function updateNewsStatus(id, status) {
  const docRef = doc(db, "news", id);
  await updateDoc(docRef, { status, updatedAt: new Date().toISOString() });
}

/**
 * Eliminar noticia + imagen si se proporcionó imagePath
 */
export async function deleteNews(id, imagePath) {
  const docRef = doc(db, "news", id);
  await deleteDoc(docRef);

  if (imagePath) {
    try {
      const imageRef = ref(storage, imagePath);
      await deleteObject(imageRef);
    } catch (e) {
      console.warn("Error eliminando imagen:", e);
    }
  }
}
