import { createContext, useContext, useEffect, useState } from "react";
import { translations } from "./translations";
import { getLanguageHint } from "../lib/telegram";

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem("shirinliklar_lang") || getLanguageHint();
    } catch {
      return "uz";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("shirinliklar_lang", lang);
    } catch {
      /* localStorage yo'q bo'lsa ham ishlayversin */
    }
  }, [lang]);

  function t(key) {
    return translations[lang]?.[key] || translations.uz[key] || key;
  }

  // Bazadan kelgan ikkitilli maydonlarni tanlash uchun: field(product, "name") -> nameUz/nameRu
  function field(obj, base) {
    if (!obj) return "";
    return lang === "ru" ? obj[`${base}Ru`] : obj[`${base}Uz`];
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t, field }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
