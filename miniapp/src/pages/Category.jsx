import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";
import { useLang } from "../i18n/LangContext";
import TopBar from "../components/TopBar";
import ProductCard from "../components/ProductCard";

export default function Category() {
  const { id } = useParams();
  const { field } = useLang();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get(`/api/products?categoryId=${id}`).then(setProducts);
    api.get("/api/categories").then((cats) => {
      setCategory(cats.find((c) => String(c.id) === String(id)) || null);
    });
  }, [id]);

  return (
    <div className="pb-20">
      <TopBar title={category ? `${category.emoji} ${field(category, "name")}` : "..."} showBack />
      <div className="grid grid-cols-2 gap-3 px-4 mt-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
