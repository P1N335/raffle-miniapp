"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useParams } from "next/navigation";
import { useTelegramAuth } from "@/app/hooks/useTelegramAuth";
import { fetchCaseBySlug } from "@/app/lib/cases-api";
import { fetchUserBalance } from "@/app/lib/profile-api";
import type { CaseDefinition } from "@/app/lib/cases";
import { CaseOpeningMachine } from "@/components/games/case-opening-machine";
import { TonWalletCard } from "@/components/games/ton-wallet-card";

export default function CaseDetailsPage() {
  const params = useParams<{ slug: string }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const { user, loading: authLoading } = useTelegramAuth();

  const [caseItem, setCaseItem] = useState<CaseDefinition | null>(null);
  const [internalBalanceTon, setInternalBalanceTon] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setError("Case slug is missing");
      setLoading(false);
      return;
    }

    const loadCase = async () => {
      try {
        const loadedCase = await fetchCaseBySlug(slug);
        setCaseItem(loadedCase);
        setError(null);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to load case");
      } finally {
        setLoading(false);
      }
    };

    loadCase();
  }, [slug]);

  useEffect(() => {
    const authenticatedUserId = user?.id;

    if (authLoading || !authenticatedUserId) {
      return;
    }

    let cancelled = false;

    const loadBalance = async () => {
      try {
        const payload = await fetchUserBalance(authenticatedUserId);

        if (!cancelled) {
          setInternalBalanceTon(payload.balanceTon);
        }
      } catch {
        if (!cancelled) {
          setInternalBalanceTon(null);
        }
      }
    };

    loadBalance();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user?.id]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#1f2a47_0%,_#111827_45%,_#0a1020_100%)] text-white">
      <div className="mx-auto w-full max-w-md px-5 py-6">
        <div className="mb-8 flex items-center gap-4 border-b border-white/10 pb-5">
          <Link
            href="/games/cases"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10"
          >
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-3xl font-bold">{caseItem?.name ?? "Case"}</h1>
        </div>

        {loading ? (
          <div className="animate-pulse">
            <div className="mx-auto h-32 w-32 rounded-[2rem] bg-white/10" />
            <div className="mx-auto mt-5 h-10 w-56 rounded-full bg-white/10" />
            <div className="mx-auto mt-3 h-6 w-44 rounded-full bg-white/10" />
            <div className="mt-8 h-56 rounded-[2rem] bg-white/8" />
          </div>
        ) : error || !caseItem ? (
          <div className="rounded-[1.8rem] border border-rose-300/20 bg-rose-500/10 px-5 py-6 text-center text-white/90">
            {error ?? "Case not found"}
          </div>
        ) : (
          <>
            <div className="text-center">
              <div
                className="mx-auto flex h-32 w-32 items-center justify-center rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.25)]"
                style={{ backgroundImage: caseItem.badgeGradient }}
              >
                <Image
                  src={caseItem.image}
                  alt={caseItem.name}
                  width={100}
                  height={100}
                  className="h-24 w-24 object-contain drop-shadow-[0_16px_18px_rgba(0,0,0,0.18)]"
                />
              </div>

              <h2 className="mt-5 text-4xl font-extrabold">{caseItem.name}</h2>
              <p className="mt-3 text-xl text-white/75">Spin to reveal your prize</p>
            </div>

            <TonWalletCard
              requiredTon={caseItem.priceTon}
              internalBalanceTon={internalBalanceTon}
            />
            <CaseOpeningMachine
              caseData={caseItem}
              internalBalanceTon={internalBalanceTon}
              onInternalBalanceChange={setInternalBalanceTon}
            />
          </>
        )}
      </div>
    </main>
  );
}
