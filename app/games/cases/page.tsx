"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BadgeDollarSign, ChevronLeft, ChevronRight, Package2, Sparkles } from "lucide-react";
import { useTelegramAuth } from "@/app/hooks/useTelegramAuth";
import { fetchCasesCatalog } from "@/app/lib/cases-api";
import { fetchUserBalance } from "@/app/lib/profile-api";
import type { CaseDefinition } from "@/app/lib/cases";

export default function CasesPage() {
  const { user, loading: authLoading, error: authError } = useTelegramAuth();
  const [cases, setCases] = useState<CaseDefinition[]>([]);
  const [balanceTon, setBalanceTon] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user?.id) {
      setLoading(false);
      setError(authError ?? "Telegram session is required to load cases");
      return;
    }

    let cancelled = false;

    const loadCases = async () => {
      try {
        const loadedCases = await fetchCasesCatalog();

        if (!cancelled) {
          setCases(loadedCases);
          setError(null);
        }
      } catch (error) {
        if (!cancelled) {
          setError(error instanceof Error ? error.message : "Failed to load cases");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCases();

    return () => {
      cancelled = true;
    };
  }, [authError, authLoading, user?.id]);

  useEffect(() => {
    const authenticatedUserId = user?.id;

    if (authLoading || !authenticatedUserId) {
      return;
    }

    let cancelled = false;

    const loadBalance = async () => {
      try {
        const payload = await fetchUserBalance();

        if (!cancelled) {
          setBalanceTon(payload.balanceTon);
        }
      } catch {
        if (!cancelled) {
          setBalanceTon(null);
        }
      }
    };

    loadBalance();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user?.id]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-5 py-6 text-white">
      <div className="mb-8 flex items-center gap-4 border-b border-white/20 pb-5">
        <Link
          href="/games"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15"
        >
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-3xl font-bold">Cases</h1>
      </div>

      <p className="mb-8 text-center text-lg text-white/90">
        Choose a case to open and win amazing prizes
      </p>

      <div className="mb-6 rounded-[1.8rem] border border-white/10 bg-white/[0.08] px-5 py-4 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-200">
            <BadgeDollarSign className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-white/45">
              Internal Balance
            </div>
            <div className="mt-1 text-2xl font-extrabold text-emerald-300">
              {balanceTon !== null ? `${balanceTon} TON` : "Connect Telegram profile"}
            </div>
            <div className="mt-1 text-sm text-white/65">
              Sold gifts credit this balance. If it covers the case price, you can open instantly.
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-2xl border border-amber-300/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {loading
          ? Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="flex items-center gap-4 rounded-3xl bg-white/90 px-5 py-5 text-black shadow-sm"
              >
                <div className="h-20 w-20 shrink-0 rounded-2xl bg-slate-200" />
                <div className="flex-1">
                  <div className="h-7 w-40 rounded-full bg-slate-200" />
                  <div className="mt-3 h-5 w-28 rounded-full bg-slate-200" />
                  <div className="mt-2 h-4 w-full rounded-full bg-slate-100" />
                </div>
              </div>
            ))
          : cases.map((caseItem) => (
              <Link
                key={caseItem.slug}
                href={`/games/cases/${caseItem.slug}`}
                className="flex items-center gap-4 rounded-3xl bg-white px-5 py-5 text-black shadow-sm transition active:scale-[0.99]"
              >
                <div
                  className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl"
                  style={{ backgroundImage: caseItem.badgeGradient }}
                >
                  <Image
                    src={caseItem.image}
                    alt={caseItem.name}
                    width={64}
                    height={64}
                    className="h-14 w-14 object-contain drop-shadow-[0_10px_14px_rgba(0,0,0,0.16)]"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="text-[1.85rem] font-extrabold leading-none">
                    {caseItem.name}
                  </h2>

                  <div className="mt-3 flex items-center gap-2 text-lg text-slate-700">
                    <Package2 className="h-4 w-4 text-slate-500" />
                    <span>Open for {caseItem.priceTon} TON</span>
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-[0.95rem] text-slate-500">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span>{caseItem.shortDescription}</span>
                  </div>
                </div>

                <ChevronRight className="h-6 w-6 shrink-0 text-slate-400" />
              </Link>
            ))}
      </div>
    </main>
  );
}
