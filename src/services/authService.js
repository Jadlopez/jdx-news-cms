// src/services/authService.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";

/**
 * Registra usuario y crea documento en Firestore
 */
export async function registerUser(email, password, name, role = "reportero") {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const uid = userCredential.user.uid;

  await setDoc(doc(db, "users", uid), {
    name,
    email,
    role,
    createdAt: new Date().toISOString(),
  });

  return userCredential.user;
}

/**
 * Inicia sesión con email/password
 * Devuelve UserCredential (como lo hace Firebase)
 */
export async function loginUser(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Inicia sesión con Google (popup)
 * Devuelve UserCredential
 */
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  // Puedes personalizar scopes o parámetros: provider.addScope(...)
  const result = await signInWithPopup(auth, provider);
  return result; // { user, ... }
}

/**
 * Cierra sesión
 */
export async function logoutUser() {
  return signOut(auth);
}

/**
 * Envía correo para restablecer contraseña
 */
export async function resetPassword(email) {
  return sendPasswordResetEmail(auth, email);
}

/**
 * Obtiene datos del usuario desde Firestore
 */
export async function getUserData(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

/**
 * Guarda o actualiza datos del usuario en Firestore (merge)
 * Útil para registrar perfiles cuando se autentican por OAuth (Google) o
 * para completar perfil después de un registro por email/password.
 */
export async function saveUserData(uid, data) {
  const ref = doc(db, "users", uid);
  // Usamos setDoc con merge para no sobrescribir campos existentes
  return setDoc(ref, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
}