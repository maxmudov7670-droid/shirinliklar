import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { useLang } from "../i18n/LangContext";

export default function OrderSuccess() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const isCake = params.get("cake") === "1";
  const { t } = useLang();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center gap-4">
      <div className="text-6xl">🎉</div>
      <h1 className="text-xl font-semibold text-cocoa">
        {isCake ? t("cakeSubmitted") : t("orderPlaced")}
      </h1>
      <p className="text-sm text-chocolate/60">#{id}</p>
      <button
        onClick={() => navigate("/")}
        className="bg-chocolate text-cream rounded-full px-6 py-3 font-medium mt-4"
      >
        {t("home")}
      </button>
    </div>
  );
}
