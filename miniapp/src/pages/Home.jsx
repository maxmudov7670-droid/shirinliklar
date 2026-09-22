import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useLang } from "../i18n/LangContext";
import TopBar from "../components/TopBar";
import ProductCard from "../components/ProductCard";

// Sozlamalar hali API'dan kelmagan (yoki admin hech narsa yuklamagan) holatda
// ko'rinadigan zaxira (fallback) logo.
const FALLBACK_LOGO = "https://i.ibb.co/mFVkCCGS/shirinliklar-start-logo.jpg";

export default function Home() {
  const { t, field } = useLang();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [startImage, setStartImage] = useState(FALLBACK_LOGO);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/api/categories"), api.get("/api/products")])
      .then(([cats, prods]) => {
        setCategories(cats);
        setProducts(prods);
      })
      .finally(() => setLoading(false));
    api.get("/api/settings").then((s) => {
      if (s.startImage) setStartImage(s.startImage);
    });
  }, []);

  return (
    <div className="pb-20">
      <TopBar title={`🍰 ${t("appName")}`} />

      <div className="px-4 pt-4">
        <img
          src={startImage}
          alt="Shirinliklar dunyosi"
          className="w-full rounded-2xl shadow-sm object-cover mb-1"
        />
      </div>

      <div className="px-4 pt-4">
        <div className="grid grid-cols-2 gap-3">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/category/${c.id}`}
              className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col active:scale-[0.98] transition"
            >
              <div className="aspect-square bg-beige overflow-hidden">
                {c.image ? (
                  <img src={c.image} alt={field(c, "name")} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">{c.emoji}</div>
                )}
              </div>
              <div className="p-3">
                <span className="text-sm font-medium text-cocoa">{field(c, "name")}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center text-cocoa/50 py-10">...</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-4 mt-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
