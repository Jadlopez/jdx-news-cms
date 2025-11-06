// src/services/authService.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
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
 * Inicia sesión
 */
export async function loginUser(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
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
