import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

function loadCart() {
  try {
    const raw = localStorage.getItem("shirinliklar_cart");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    try {
      localStorage.setItem("shirinliklar_cart", JSON.stringify(items));
    } catch {
      /* localStorage yo'q bo'lsa ham ishlayversin */
    }
  }, [items]);

  function addItem(product, qty = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, qty: Math.min(99, i.qty + qty) } : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          nameUz: product.nameUz,
          nameRu: product.nameRu,
          price: product.price,
          imageUrl: product.imageUrl,
          qty,
        },
      ];
    });
  }

  function updateQty(productId, qty) {
    if (qty <= 0) return removeItem(productId);
    setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, qty } : i)));
  }

  function removeItem(productId) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  function clearCart() {
    setItems([]);
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addItem, updateQty, removeItem, clearCart, subtotal, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
