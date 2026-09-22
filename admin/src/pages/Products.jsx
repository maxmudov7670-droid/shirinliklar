import { useEffect, useState } from "react";
import { api } from "../lib/api";

const empty = {
  categoryId: "", nameUz: "", nameRu: "", descriptionUz: "", descriptionRu: "",
  ingredientsUz: "", ingredientsRu: "", weight: "", price: "", oldPrice: "",
  imageUrl: "", isAvailable: true,
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  function load() {
    api.get("/api/products?all=true").then(setProducts);
    api.get("/api/categories?all=true").then(setCategories);
  }

  useEffect(load, []);

  function edit(p) {
    setEditingId(p.id);
    setForm({
      categoryId: p.categoryId, nameUz: p.nameUz, nameRu: p.nameRu,
      descriptionUz: p.descriptionUz || "", descriptionRu: p.descriptionRu || "",
      ingredientsUz: p.ingredientsUz || "", ingredientsRu: p.ingredientsRu || "",
      weight: p.weight || "", price: p.price, oldPrice: p.oldPrice || "",
      imageUrl: p.imageUrl || "", isAvailable: p.isAvailable,
    });
    setShowForm(true);
  }

  function resetForm() {
    setEditingId(null);
    setForm(empty);
    setShowForm(false);
  }

  async function handleImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await api.upload("/api/upload", file);
      setForm((f) => ({ ...f, imageUrl: url }));
    } catch (e2) {
      alert(e2.message);
    } finally {
      setUploading(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      const payload = { ...form, categoryId: Number(form.categoryId), price: Number(form.price) };
      if (editingId) {
        await api.put(`/api/products/${editingId}`, payload);
      } else {
        await api.post("/api/products", payload);
      }
      resetForm();
      load();
    } catch (e2) {
      setError(e2.message);
    }
  }

  async function remove(id) {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    await api.del(`/api/products/${id}`);
    load();
  }

  const inputClass = "block w-full rounded-lg border border-beige px-2 py-1.5 text-sm";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-cocoa">🍰 Mahsulotlar</h1>
        <button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="bg-chocolate text-cream rounded-lg px-4 py-1.5 text-sm font-medium"
        >
          {showForm ? "Bekor qilish" : "+ Yangi mahsulot"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white rounded-2xl shadow-sm p-4 mb-6 grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-cocoa/60">Kategoriya</label>
            <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className={inputClass}>
              <option value="">Tanlang</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.emoji} {c.nameUz}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-cocoa/60">Rasm</label>
            <input type="file" accept="image/*" onChange={handleImage} className="block w-full text-xs" />
            {uploading && <span className="text-xs text-cocoa/50">Yuklanmoqda...</span>}
            {form.imageUrl && <img src={form.imageUrl} alt="" className="w-16 h-16 rounded-lg object-cover mt-1" />}
          </div>
          <div>
            <label className="text-xs text-cocoa/60">Nomi (O'zbekcha) *</label>
            <input value={form.nameUz} onChange={(e) => setForm({ ...form, nameUz: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-cocoa/60">Nomi (Русский) *</label>
            <input value={form.nameRu} onChange={(e) => setForm({ ...form, nameRu: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-cocoa/60">Tavsifi (O'zbekcha)</label>
            <textarea value={form.descriptionUz} onChange={(e) => setForm({ ...form, descriptionUz: e.target.value })} className={inputClass} rows={2} />
          </div>
          <div>
            <label className="text-xs text-cocoa/60">Tavsifi (Русский)</label>
            <textarea value={form.descriptionRu} onChange={(e) => setForm({ ...form, descriptionRu: e.target.value })} className={inputClass} rows={2} />
          </div>
          <div>
            <label className="text-xs text-cocoa/60">Tarkibi (O'zbekcha)</label>
            <textarea value={form.ingredientsUz} onChange={(e) => setForm({ ...form, ingredientsUz: e.target.value })} className={inputClass} rows={2} />
          </div>
          <div>
            <label className="text-xs text-cocoa/60">Tarkibi (Русский)</label>
            <textarea value={form.ingredientsRu} onChange={(e) => setForm({ ...form, ingredientsRu: e.target.value })} className={inputClass} rows={2} />
          </div>
          <div>
            <label className="text-xs text-cocoa/60">Og'irligi/porsiyasi</label>
            <input value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className={inputClass} placeholder="500 g" />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-cocoa/60">Narxi (so'm) *</label>
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputClass} />
            </div>
            <div className="flex-1">
              <label className="text-xs text-cocoa/60">Eski narxi</label>
              <input type="number" value={form.oldPrice} onChange={(e) => setForm({ ...form, oldPrice: e.target.value })} className={inputClass} />
            </div>
          </div>
          <label className="flex items-center gap-1.5 text-sm text-cocoa">
            <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} />
            Mavjud
          </label>
          <div className="col-span-2 flex items-center gap-3">
            <button type="submit" className="bg-chocolate text-cream rounded-lg px-4 py-1.5 text-sm font-medium">
              {editingId ? "Saqlash" : "Qo'shish"}
            </button>
            {error && <div className="text-sm text-red-500">{error}</div>}
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-sm divide-y divide-beige">
        {products.map((p) => (
          <div key={p.id} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-beige overflow-hidden shrink-0">
                {p.imageUrl && <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />}
              </div>
              <div>
                <div className="text-sm font-medium text-cocoa">{p.nameUz}</div>
                <div className="text-xs text-chocolate/60">
                  {p.category?.emoji} {p.category?.nameUz} · {p.price.toLocaleString("uz-UZ")} so'm
                  {!p.isAvailable && <span className="text-red-500"> · Mavjud emas</span>}
                </div>
              </div>
            </div>
            <div className="flex gap-3 text-sm">
              <button onClick={() => edit(p)} className="text-chocolate">Tahrirlash</button>
              <button onClick={() => remove(p.id)} className="text-red-500">O'chirish</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
