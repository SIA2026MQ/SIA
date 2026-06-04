import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { detectCurrencyFromIP, type CurrencyCode } from "@/utils/pricing";

type CurrencyContextType = {
  currency: CurrencyCode;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyCode>("USD");

  useEffect(() => {
    // Detect currency once on mount and store in state
    detectCurrencyFromIP().then((detected) => {
      setCurrency(detected);
    });
  }, []);

  return (
    <CurrencyContext.Provider value={{ currency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

// The Hook you requested
export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}