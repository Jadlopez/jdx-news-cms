// src/components/layout/Footer.jsx
import React from "react";

export default function Footer() {
  return (
    <footer style={{ background: "#f5f7fa", padding: 20, textAlign: "center" }}>
      <small>© {new Date().getFullYear()} JDX News — CMS. Hecho con ❤️</small>
    </footer>
  );
}
