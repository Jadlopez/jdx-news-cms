// src/App.jsx
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import PrivateRoute from "./components/layout/PrivateRoute";

// pages (puedes lazy-load)
const Home = lazy(() => import("./pages/Home"));
const NewsView = lazy(() => import("./components/news/NewsView"));
const Login = lazy(() => import("./components/auth/Login"));
const Register = lazy(() => import("./components/auth/Register"));
const Dashboard = lazy(() => import("./components/dashboard/Dashboard"));
const ReporterDashboard = lazy(() => import("./components/dashboard/ReporterDashboard"));
const EditorDashboard = lazy(() => import("./components/dashboard/EditorDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

export default function App() {
  return (
    <div className="flex justify-center items-center h-screen">
      <Header />

      <main style={{ minHeight: "70vh" }}>
        <Suspense fallback={<div>Cargando...</div>}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/noticia/:id" element={<NewsView />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected: sólo usuarios autenticados */}
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              {/* rutas específicas por rol */}
              <Route element={<PrivateRoute allowedRoles={["reportero"]} />}>
                <Route path="/dashboard/reportero" element={<ReporterDashboard />} />
              </Route>

              <Route element={<PrivateRoute allowedRoles={["editor"]} />}>
                <Route path="/dashboard/editor" element={<EditorDashboard />} />
              </Route>

              <Route path="/dashboard/no-autorizado" element={<div>No tienes permisos para acceder</div>} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
