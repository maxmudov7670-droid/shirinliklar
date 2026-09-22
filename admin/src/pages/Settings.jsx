import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Settings() {
  const [startImage, setStartImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/api/settings").then((s) => setStartImage(s.startImage || ""));
  }, []);

  async function handleImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const { url } = await api.upload("/api/upload", file);
      setStartImage(url);
      setSaved(false);
    } catch (e2) {
      setError(e2.message);
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await api.put("/api/settings", { startImage: startImage || null });
      setSaved(true);
    } catch (e2) {
      setError(e2.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-cocoa mb-4">⚙️ Sozlamalar</h1>

      <div className="bg-white rounded-2xl shadow-sm p-4 max-w-md">
        <div className="text-sm font-medium text-cocoa mb-1">Bot va Mini App logosi</div>
        <p className="text-xs text-chocolate/60 mb-3">
          Bu rasm mijoz botga /start yuborganda va Mini App bosh sahifasi yuqorisida ko'rinadi.
        </p>

        {startImage && (
          <img src={startImage} alt="" className="w-full rounded-xl object-cover mb-3" />
        )}

        <input type="file" accept="image/*" onChange={handleImage} className="block w-full text-xs mb-3" />
        {uploading && <div className="text-xs text-cocoa/50 mb-2">Yuklanmoqda...</div>}

        <div className="flex items-center gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="bg-chocolate text-cream rounded-lg px-4 py-1.5 text-sm font-medium disabled:opacity-50"
          >
            {saving ? "Saqlanmoqda..." : "Saqlash"}
          </button>
          {saved && <span className="text-sm text-green-600">Saqlandi ✓</span>}
          {error && <span className="text-sm text-red-500">{error}</span>}
        </div>
      </div>
    </div>
  );
}
