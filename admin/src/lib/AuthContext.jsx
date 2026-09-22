import { createContext, useContext, useState } from "react";
import { api, setPassword, clearPassword, hasPassword } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authed, setAuthed] = useState(hasPassword());
  const [error, setError] = useState("");

  async function login(password) {
    setError("");
    try {
      await api.post("/api/admin/login", { password });
      setPassword(password);
      setAuthed(true);
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    }
  }

  function logout() {
    clearPassword();
    setAuthed(false);
  }

  return (
    <AuthContext.Provider value={{ authed, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
