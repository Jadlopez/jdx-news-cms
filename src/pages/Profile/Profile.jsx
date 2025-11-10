import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { updateUserProfile, getUserById } from "../../services/userService";
import { uploadImage } from "../../services/newsService";
import toast from "react-hot-toast";
import "./Profile.css";

export default function Profile() {
  const { user, userData, refreshUserData } = useAuth();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    bio: "",
    avatarUrl: "",
    avatarPath: "",
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // Cargar datos iniciales (prioriza userData del contexto)
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        if (userData) {
          if (!mounted) return;
          setForm({
            name: userData.name || "",
            phone: userData.phone || "",
            bio: userData.bio || "",
            avatarUrl: userData.avatar_url || "",
            avatarPath: userData.avatar_path || "",
          });
        } else if (user?.id) {
          // fallback: obtener desde la tabla users
          const profile = await getUserById(user.id);
          if (!mounted) return;
          setForm({
            name: profile?.name || "",
            phone: profile?.phone || "",
            bio: profile?.bio || "",
            avatarUrl: profile?.avatar_url || "",
            avatarPath: profile?.avatar_path || "",
          });
        }
      } catch (err) {
        console.error("Error cargando perfil:", err);
        toast.error("No se pudo cargar tu perfil");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [user, userData]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const tid = toast.loading("Subiendo avatar...");
    try {
      const { url, path } = await uploadImage(file, "avatars");
      setForm((f) => ({ ...f, avatarUrl: url, avatarPath: path }));
      toast.success("Avatar subido", { id: tid });
    } catch (err) {
      console.error("Error subiendo avatar:", err);
      toast.error("No se pudo subir el avatar", { id: tid });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user?.id) {
      toast.error("No estás autenticado");
      return;
    }
    setSaving(true);
    try {
      await updateUserProfile(user.id, {
        name: form.name,
        phone: form.phone,
        bio: form.bio,
        avatar_url: form.avatarUrl,
        avatar_path: form.avatarPath,
      });
      toast.success("Perfil actualizado");
      if (typeof refreshUserData === "function") await refreshUserData();
    } catch (err) {
      console.error("Error guardando perfil:", err);
      toast.error("No se pudo guardar tu perfil");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-500">Cargando perfil…</div>;

  return (
    <div className="profile-page max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4 text-jdx-dark">Editar perfil</h1>

      <form onSubmit={handleSave} className="bg-white p-6 rounded-xl shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-1 flex flex-col items-center">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-100 mb-3">
              {form.avatarUrl ? (
                // eslint-disable-next-line jsx-a11y/img-redundant-alt
                <img src={form.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">Sin avatar</div>
              )}
            </div>
            <label className="cursor-pointer text-sm text-jdx-accent">
              Cambiar avatar
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </label>
          </div>

          <div className="md:col-span-2 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded-md px-3 py-2"
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border rounded-md px-3 py-2"
                placeholder="Opcional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Biografía</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className="w-full border rounded-md px-3 py-2"
                rows={4}
                placeholder="Pequeña descripción sobre ti"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-md bg-jdx-accent text-white font-semibold"
              >
                {saving ? "Guardando…" : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}