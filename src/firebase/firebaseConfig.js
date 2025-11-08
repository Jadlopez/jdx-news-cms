// src/firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCcVd4YdEDS7iOhqFbWObXoER_lzS27fx0",
  authDomain: "jdx-news-cms.firebaseapp.com",
  projectId: "jdx-news-cms",
  storageBucket: "jdx-news-cms.firebasestorage.app",
  messagingSenderId: "71271426657",
  appId: "1:71271426657:web:5b9eb5a47ef6c4e68f9820",
  measurementId: "G-CR1D6MZVT5",
};
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
