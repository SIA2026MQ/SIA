import { useMemo } from "react";
import { useCurrency } from "@/hooks/useCurrency";
import { getLocalizedPrice, type PriceableItem } from "@/utils/pricing";

export function useRegionalPricing() {
  // Grab the globally detected currency (INR or USD) from our provider
  const { currency } = useCurrency();

  return useMemo(
    () => ({
      currency,
      // The new localizePrice expects an object with both priceINR and priceUSD
      localizePrice: (item: PriceableItem) => getLocalizedPrice(item, currency),
    }),
    [currency],
  );
}