"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, ExternalLink, HandCoins } from "lucide-react";
import { useTelegramAuth } from "@/app/hooks/useTelegramAuth";
import {
  fetchInventoryItem,
  sellInventoryItem,
  withdrawInventoryItem,
} from "@/app/lib/profile-api";
import type { ProfileInventoryItem } from "@/app/lib/profile";

const statusLabels: Record<ProfileInventoryItem["status"], string> = {
  owned: "In inventory",
  in_coinflip: "Locked in CoinFlip",
  sold: "Sold",
  withdraw_pending: "Withdraw requested",
  withdrawn: "Withdrawn",
};

export default function InventoryItemPage() {
  const params = useParams<{ openingId: string }>();
  const openingId = Array.isArray(params.openingId) ? params.openingId[0] : params.openingId;
  const router = useRouter();
  const { user, loading } = useTelegramAuth();
  const userId = user?.id ?? null;

  const [item, setItem] = useState<ProfileInventoryItem | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!userId || !openingId) {
      setPageLoading(false);
      setError("Inventory item is unavailable");
      return;
    }

    let cancelled = false;

    const loadItem = async () => {
      setPageLoading(true);

      try {
        const payload = await fetchInventoryItem(openingId);

        if (!cancelled) {
          setItem(payload);
          setError(null);
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof Error ? error.message : "Failed to load inventory item"
          );
        }
      } finally {
        if (!cancelled) {
          setPageLoading(false);
        }
      }
    };

    loadItem();

    return () => {
      cancelled = true;
    };
  }, [loading, openingId, userId]);

  const canSell = item?.status === "owned";
  const canWithdraw = item?.status === "owned";

  const runAction = (action: "sell" | "withdraw") => {
    if (!userId || !item) {
      return;
    }

    startTransition(async () => {
      try {
        const updatedItem =
          action === "sell"
            ? await sellInventoryItem(item.id)
            : await withdrawInventoryItem(item.id);

        setItem(updatedItem);
        setError(null);
        setActionMessage(
          action === "sell"
            ? `${updatedItem.reward.name} was sold for ${updatedItem.soldAmountTon} TON`
            : "Withdrawal request was created for this gift"
        );
        router.refresh();
      } catch (error) {
        setActionMessage(null);
        setError(error instanceof Error ? error.message : "Action failed");
      }
    });
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#16213c_0%,_#0e1628_45%,_#09101d_100%)] text-white">
      <div className="mx-auto w-full max-w-md px-5 py-6">
        <div className="mb-8 flex items-center gap-4 border-b border-white/10 pb-5">
          <Link
            href="/profile"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10"
          >
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-3xl font-bold">Gift Item</h1>
        </div>

        {pageLoading ? (
          <div className="animate-pulse">
            <div className="mx-auto h-40 w-40 rounded-[2rem] bg-white/10" />
            <div className="mx-auto mt-5 h-10 w-52 rounded-full bg-white/10" />
            <div className="mx-auto mt-3 h-6 w-36 rounded-full bg-white/10" />
            <div className="mt-8 h-48 rounded-[2rem] bg-white/8" />
          </div>
        ) : error || !item ? (
          <div className="rounded-[1.8rem] border border-rose-300/20 bg-rose-500/10 px-5 py-6 text-center text-white/90">
            {error ?? "Gift item not found"}
          </div>
        ) : (
          <>
            <div className="text-center">
              <div
                className="mx-auto flex h-40 w-40 items-center justify-center rounded-[2.2rem] shadow-[0_24px_40px_rgba(0,0,0,0.24)]"
                style={{ backgroundImage: item.reward.accent }}
              >
                <Image
                  src={item.reward.image}
                  alt={item.reward.name}
                  width={124}
                  height={124}
                  className="h-28 w-28 object-contain drop-shadow-[0_18px_20px_rgba(0,0,0,0.18)]"
                />
              </div>

              <h2 className="mt-5 text-4xl font-extrabold">{item.reward.name}</h2>
              <p className="mt-2 text-lg text-white/70">{item.reward.valueLabel}</p>
              <div className="mt-3 text-sm uppercase tracking-[0.2em] text-white/45">
                Item ID: {item.reward.id}
              </div>
            </div>

            <div className="mt-8 rounded-[1.8rem] border border-white/10 bg-white/[0.06] p-5">
              <div className="grid grid-cols-2 gap-3">
                <StatBox label="Estimated value" value={`${item.reward.estimatedValueTon} TON`} />
                <StatBox label="Status" value={statusLabels[item.status]} />
                <StatBox label="Opened from" value={item.case.name} />
                <StatBox label="Rarity" value={item.reward.rarity} />
              </div>
            </div>

            {actionMessage && (
              <div className="mt-5 rounded-[1.4rem] border border-emerald-300/20 bg-emerald-500/10 px-4 py-3 text-center text-sm text-emerald-100">
                {actionMessage}
              </div>
            )}

            <div className="mt-6 grid gap-3">
              <button
                onClick={() => runAction("sell")}
                disabled={!canSell || isPending}
                className="flex items-center justify-center gap-2 rounded-[1.5rem] bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-5 text-lg font-extrabold text-white shadow-[0_14px_30px_rgba(16,185,129,0.25)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <HandCoins className="h-5 w-5" />
                {isPending && canSell
                  ? "Selling..."
                  : `Sell for ${item.reward.estimatedValueTon} TON`}
              </button>

              <button
                onClick={() => runAction("withdraw")}
                disabled={!canWithdraw || isPending}
                className="flex items-center justify-center gap-2 rounded-[1.5rem] bg-gradient-to-r from-sky-500 to-indigo-500 px-6 py-5 text-lg font-extrabold text-white shadow-[0_14px_30px_rgba(59,130,246,0.25)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ExternalLink className="h-5 w-5" />
                {isPending && canWithdraw ? "Requesting..." : "Withdraw"}
              </button>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.06] px-5 py-4 text-sm text-white/75">
              Selling marks the item as sold for its TON price. Withdraw creates a withdrawal
              request so the gift can be processed outside the inventory flow.
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.3rem] border border-white/10 bg-[#111b31] px-4 py-4">
      <div className="text-xs uppercase tracking-[0.18em] text-white/45">{label}</div>
      <div className="mt-2 text-base font-extrabold text-white">{value}</div>
    </div>
  );
}
