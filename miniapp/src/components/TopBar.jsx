import { useNavigate } from "react-router-dom";
import { useLang } from "../i18n/LangContext";

export default function TopBar({ title, showBack = false }) {
  const navigate = useNavigate();
  const { lang, setLang } = useLang();

  return (
    <div
      className="sticky top-0 z-30 bg-cream/95 backdrop-blur flex items-center justify-between px-4 py-3 border-b border-beige"
      style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 0.75rem)" }}
    >
      <div className="flex items-center gap-2 min-w-0">
        {showBack && (
          <button onClick={() => navigate(-1)} className="text-xl text-cocoa">
            ←
          </button>
        )}
        <h1 className="text-lg font-semibold text-cocoa truncate">{title}</h1>
      </div>
      <button
        onClick={() => setLang(lang === "uz" ? "ru" : "uz")}
        className="text-xs font-medium bg-beige text-cocoa px-2.5 py-1 rounded-full shrink-0"
      >
        {lang === "uz" ? "RU" : "UZ"}
      </button>
    </div>
  );
}
