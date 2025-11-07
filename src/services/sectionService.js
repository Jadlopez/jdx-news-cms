// src/services/sectionService.js
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

/**
 * Colección de secciones (categorías de noticias)
 */
const sectionCollection = collection(db, "sections");

/**
 * Obtiene todas las secciones ordenadas alfabéticamente
 */
export const getSections = async () => {
  const q = query(sectionCollection, orderBy("name", "asc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Crea una nueva sección
 * @param {Object} sectionData - { name, description }
 */
export const createSection = async (sectionData) => {
  const docRef = await addDoc(sectionCollection, sectionData);
  return docRef.id;
};

/**
 * Obtiene una sección por ID
 */
export const getSectionById = async (id) => {
  const docRef = doc(db, "sections", id);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
};

/**
 * Actualiza una sección existente
 */
export const updateSection = async (id, updatedData) => {
  const docRef = doc(db, "sections", id);
  await updateDoc(docRef, updatedData);
};

/**
 * Elimina una sección
 */
export const deleteSection = async (id) => {
  const docRef = doc(db, "sections", id);
  await deleteDoc(docRef);
};
