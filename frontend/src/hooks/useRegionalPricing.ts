import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export function useRegionalPricing() {
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [isCurrencyReady, setIsCurrencyReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchCurrency = async () => {
      try {
        const { currency: serverCurrency } = await api.getCurrency();
        if (!cancelled) {
          setCurrency(serverCurrency);
          setIsCurrencyReady(true);
        }
      } catch (error) {
        // Fallback to timezone if backend call fails
        console.warn('Currency detection failed, using timezone fallback.');
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setCurrency(timeZone === 'Asia/Calcutta' || timeZone === 'Asia/Kolkata' ? 'INR' : 'USD');
        setIsCurrencyReady(true);
      }
    };

    fetchCurrency();
    return () => { cancelled = true; };
  }, []);

  const getPrice = (item: any): number => {
    if (!item) return 0;
    return currency === 'INR'
      ? Number(item.priceInr || item.priceINR || 0)
      : Number(item.priceUsd || item.priceUSD || 0);
  };

  const localizePrice = (item: any): string => {
    const price = getPrice(item);
    return currency === 'INR'
      ? `₹${price.toLocaleString('en-IN')}`
      : `$${price.toLocaleString('en-US')}`;
  };

  const formatAmount = (amount: number): string => {
    return currency === 'INR'
      ? `₹${amount.toLocaleString('en-IN')}`
      : `$${amount.toLocaleString('en-US')}`;
  };

  return { currency, getPrice, localizePrice, formatAmount, isCurrencyReady };
}