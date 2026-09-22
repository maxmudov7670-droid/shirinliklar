import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { LangProvider } from "./i18n/LangContext";
import { CartProvider } from "./lib/CartContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <LangProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </LangProvider>
    </HashRouter>
  </React.StrictMode>
);
