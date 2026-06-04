export type CurrencyCode = "USD" | "INR";

// Centralized pricing data structure for your managed items
// In a real app, this could be fetched from your backend/database
export interface PriceableItem {
  priceINR: number; // Admin-set price for India
  priceUSD: number; // Admin-set price for Global
}

/**
 * Formats a raw number into a localized currency string.
 */
export function formatAmount(amount: number, currency: CurrencyCode): string {
  const locale = currency === "INR" ? "en-IN" : "en-US";
  
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Returns the correct price for an item based on the user's detected currency.
 * Use this in your Product Cards and Checkout components.
 */
export function getLocalizedPrice(item: PriceableItem, currency: CurrencyCode): string {
  const amount = currency === "INR" ? item.priceINR : item.priceUSD;
  return formatAmount(amount, currency);
}

/**
 * Detects currency based on IP address via ipapi.co.
 * Results are cached in localStorage to prevent redundant API calls.
 */
export async function detectCurrencyFromIP(): Promise<CurrencyCode> {
  const STORAGE_KEY = "sia-user-currency";
  
  if (typeof window === "undefined") return "USD";
  
  const existing = window.localStorage.getItem(STORAGE_KEY);
  if (existing === "USD" || existing === "INR") return existing;

  try {
    const response = await fetch("https://ipapi.co/json/");
    if (!response.ok) throw new Error("IP API failed");
    
    const data = await response.json();
    const detected = data.country_code === "IN" ? "INR" : "USD";
    
    window.localStorage.setItem(STORAGE_KEY, detected);
    return detected;
  } catch {
    // Fallback: Check timezone if IP lookup fails
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
    const fallback = timezone.includes("Kolkata") ? "INR" : "USD";
    window.localStorage.setItem(STORAGE_KEY, fallback);
    return fallback;
  }
}