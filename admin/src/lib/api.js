const API_URL = import.meta.env.VITE_API_URL || "";

function getPassword() {
  try {
    return sessionStorage.getItem("shirinliklar_admin_password") || "";
  } catch {
    return "";
  }
}

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-admin-password": getPassword(),
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
  patch: (path, body) => request(path, { method: "PATCH", body: JSON.stringify(body) }),
  del: (path) => request(path, { method: "DELETE" }),
  upload: async (path, file) => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "x-admin-password": getPassword() },
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Yuklashda xatolik");
    return data;
  },
};

export function setPassword(pw) {
  try {
    sessionStorage.setItem("shirinliklar_admin_password", pw);
  } catch {
    /* sessionStorage yo'q bo'lsa ham ishlayversin */
  }
}

export function clearPassword() {
  try {
    sessionStorage.removeItem("shirinliklar_admin_password");
  } catch {
    /* ignore */
  }
}

export function hasPassword() {
  return Boolean(getPassword());
}
