import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { CartProvider } from "@/components/common/CartContext";
import { CurrencyProvider } from "@/hooks/useCurrency"; 
import { AuthProvider } from "@/context/AuthContext"; // <--- IMPORT THIS
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider> {/* <--- MUST BE AT THE TOP */}
      <CurrencyProvider>
        <CartProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </CartProvider>
      </CurrencyProvider>
    </AuthProvider>
  </React.StrictMode>,
);