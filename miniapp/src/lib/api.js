import { getInitData } from "./telegram";

const API_URL = import.meta.env.VITE_API_URL || "";

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Telegram-Init-Data": getInitData(),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Xatolik yuz berdi");
  }
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: "PUT", body: JSON.stringify(body) }),
  del: (path) => request(path, { method: "DELETE" }),
  upload: async (path, file) => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "X-Telegram-Init-Data": getInitData() },
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Yuklashda xatolik");
    return data;
  },
};
