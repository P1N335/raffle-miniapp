"use client";

import { useEffect, useState } from "react";
import { fetchWalletBalance } from "@/app/lib/cases-api";
import type { WalletBalanceSummary } from "@/app/lib/cases";

export function useTonWalletBalance(address: string) {
  const [balance, setBalance] = useState<WalletBalanceSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setBalance(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadBalance = async () => {
      setLoading(true);

      try {
        const payload = await fetchWalletBalance(address);

        if (!cancelled) {
          setBalance(payload);
          setError(null);
        }
      } catch (error) {
        if (!cancelled) {
          setError(error instanceof Error ? error.message : "Failed to load wallet balance");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadBalance();

    return () => {
      cancelled = true;
    };
  }, [address]);

  return { balance, loading, error };
}
