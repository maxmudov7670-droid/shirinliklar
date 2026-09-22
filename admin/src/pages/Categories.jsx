import { useEffect, useState } from "react";
import { api } from "../lib/api";

const empty = { emoji: "", nameUz: "", nameRu: "", sortOrder: 0, isActive: true };

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  function load() {
    api.get("/api/categories?all=true").then(setCategories);
  }

  useEffect(load, []);

  function edit(c) {
    setEditingId(c.id);
    setForm({ emoji: c.emoji, nameUz: c.nameUz, nameRu: c.nameRu, sortOrder: c.sortOrder, isActive: c.isActive });
  }

  function resetForm() {
    setEditingId(null);
    setForm(empty);
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await api.put(`/api/categories/${editingId}`, form);
      } else {
        await api.post("/api/categories", form);
      }
      resetForm();
      load();
    } catch (e2) {
      setError(e2.message);
    }
  }

  async function remove(id) {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    try {
      await api.del(`/api/categories/${id}`);
      load();
    } catch (e2) {
      alert(e2.message);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-cocoa mb-4">🗂️ Kategoriyalar</h1>

      <form onSubmit={submit} className="bg-white rounded-2xl shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-cocoa/60">Emoji</label>
          <input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })}
            className="block w-16 rounded-lg border border-beige px-2 py-1.5 text-sm" />
        </div>
        <div>
          <label className="text-xs text-cocoa/60">Nomi (O'zbekcha)</label>
          <input value={form.nameUz} onChange={(e) => setForm({ ...form, nameUz: e.target.value })}
            className="block rounded-lg border border-beige px-2 py-1.5 text-sm" />
        </div>
        <div>
          <label className="text-xs text-cocoa/60">Nomi (Русский)</label>
          <input value={form.nameRu} onChange={(e) => setForm({ ...form, nameRu: e.target.value })}
            className="block rounded-lg border border-beige px-2 py-1.5 text-sm" />
        </div>
        <div>
          <label className="text-xs text-cocoa/60">Tartib</label>
          <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
            className="block w-20 rounded-lg border border-beige px-2 py-1.5 text-sm" />
        </div>
        <label className="flex items-center gap-1.5 text-sm text-cocoa">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
          Faol
        </label>
        <button type="submit" className="bg-chocolate text-cream rounded-lg px-4 py-1.5 text-sm font-medium">
          {editingId ? "Saqlash" : "Qo'shish"}
        </button>
        {editingId && (
          <button type="button" onClick={resetForm} className="text-sm text-cocoa/60">Bekor qilish</button>
        )}
        {error && <div className="text-sm text-red-500 w-full">{error}</div>}
      </form>

      <div className="bg-white rounded-2xl shadow-sm divide-y divide-beige">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="text-xl">{c.emoji}</span>
              <div>
                <div className="text-sm font-medium text-cocoa">{c.nameUz} / {c.nameRu}</div>
                {!c.isActive && <span className="text-xs text-red-500">Nofaol</span>}
              </div>
            </div>
            <div className="flex gap-3 text-sm">
              <button onClick={() => edit(c)} className="text-chocolate">Tahrirlash</button>
              <button onClick={() => remove(c.id)} className="text-red-500">O'chirish</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
