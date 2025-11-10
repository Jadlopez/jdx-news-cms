// src/utils/formatDate.js
// Small helper to format dates consistently across the app.
// Exports a default function: formatDate(dateLike, long = false)

export default function formatDate(dateLike, long = false) {
  if (!dateLike) return "";
  const d =
    typeof dateLike === "string" || typeof dateLike === "number"
      ? new Date(dateLike)
      : dateLike;
  if (!(d instanceof Date) || isNaN(d)) return String(dateLike);

  const opts = long
    ? {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    : { year: "numeric", month: "short", day: "numeric" };

  try {
    return new Intl.DateTimeFormat("es-ES", opts).format(d);
  } catch (e) {
    return d.toLocaleString();
  }
}