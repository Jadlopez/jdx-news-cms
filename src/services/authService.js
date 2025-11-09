// src/services/authService.js
// MODO MOCK COMPATIBLE CON TU LOGIN Y REGISTER

const USERS_KEY = "mock_users";
const SESSION_KEY = "mock_session";

function loadUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// ✅ REGISTRO (EMAIL + PASSWORD)
export function registerUser(email, password, name, role = "reportero") {
  const users = loadUsers();

  if (users.some((u) => u.email === email)) {
    throw new Error("El correo ya está registrado.");
  }

  const newUser = {
    uid: crypto.randomUUID(), // 👈 AHORA SÍ UID !!!
    name,
    email,
    password,
    role,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);
  localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));

  return newUser;
}

// ✅ LOGIN
export function loginUser(email, password) {
  const users = loadUsers();
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    throw new Error("Correo o contraseña incorrectos.");
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

// ✅ LOGIN CON GOOGLE (SIMULADO)
export function signInWithGoogle() {
  const newUser = {
    uid: crypto.randomUUID(),
    name: "Usuario Google",
    email: "googleuser@example.com",
    role: "reportero",
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
  return newUser;
}

// ✅ OBTENER PERFIL
export function getUserData(uid) {
  const users = loadUsers();
  return users.find((u) => u.uid === uid) || null;
}

// ✅ GUARDAR PERFIL
export function saveUserData(uid, data) {
  const users = loadUsers();
  const index = users.findIndex((u) => u.uid === uid);

  if (index === -1) return null;

  users[index] = { ...users[index], ...data };
  saveUsers(users);
  localStorage.setItem(SESSION_KEY, JSON.stringify(users[index]));
  return users[index];
}

// ✅ LOGOUT
export function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
}

// ✅ OBTENER USUARIO LOGUEADO
export function getCurrentUser() {
  return JSON.parse(localStorage.getItem(SESSION_KEY)) || null;
}
