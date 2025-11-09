import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

// Layout components
import Header from "./components/layout/Header/Header";
import Footer from "./components/layout/Footer/Footer";
import PrivateRoute from "./components/layout/PrivateRoute/PrivateRoute";

// Lazy-loaded pages
const Home = lazy(() => import("./pages/Home/Home"));
const NewsView = lazy(() => import("./components/news/NewsView/NewsView"));
const Login = lazy(() => import("./components/auth/Login/Login"));
const Register = lazy(() => import("./components/auth/Register/Register"));
const Dashboard = lazy(() =>
  import("./components/dashboard/Dashboard/Dashboard")
);
const ReporterDashboard = lazy(() =>
  import("./components/dashboard/ReporterDashboard/ReporterDashboard")
);
const EditorDashboard = lazy(() =>
  import("./components/dashboard/EditorDashboard/EditorDashboard")
);
const NotFound = lazy(() => import("./pages/NotFound/NotFound"));

export default function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1">
        <Suspense
          fallback={<div className="text-center mt-10">Cargando...</div>}
        >
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/noticia/:id" element={<NewsView />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              element={<PrivateRoute allowedRoles={["editor", "reportero"]} />}
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route
                path="/dashboard/reportero"
                element={<ReporterDashboard />}
              />
              <Route path="/dashboard/editor" element={<EditorDashboard />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
