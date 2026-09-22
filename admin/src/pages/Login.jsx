import { useState } from "react";
import { useAuth } from "../lib/AuthContext";

export default function Login() {
  const { login, error } = useAuth();
  const [password, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    await login(password);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <form onSubmit={submit} className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-sm">
        <div className="text-3xl text-center mb-2">🍰</div>
        <h1 className="text-lg font-semibold text-cocoa text-center mb-6">Shirinliklar — Admin</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Parol"
          className="w-full rounded-xl border border-beige px-3 py-2 text-sm mb-3"
          autoFocus
        />
        {error && <div className="text-sm text-red-500 mb-3">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-chocolate text-cream rounded-xl py-2.5 font-medium disabled:opacity-50"
        >
          Kirish
        </button>
      </form>
    </div>
  );
}
