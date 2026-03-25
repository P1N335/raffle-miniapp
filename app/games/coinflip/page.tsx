"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Gift } from "lucide-react";
import CoinflipWheel from "@/components/games/coinflip-wheel";

type Side = "heads" | "tails";

export default function CoinflipPage() {
  const [leftReady, setLeftReady] = useState(false);
  const [rightReady, setRightReady] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [winnerSide, setWinnerSide] = useState<Side | null>(null);
  const [rotationDeg, setRotationDeg] = useState(0);

  const canFlip = useMemo(() => leftReady && rightReady && !isFlipping, [leftReady, rightReady, isFlipping]);

  useEffect(() => {
    if (!canFlip) return;

    const timeout = setTimeout(() => {
      const result: Side = Math.random() > 0.5 ? "heads" : "tails";
      setWinnerSide(result);
      setIsFlipping(true);

      const target = result === "heads" ? 0 : 180;
      setRotationDeg((prev) => prev + 1800 + target);
    }, 500);

    return () => clearTimeout(timeout);
  }, [canFlip]);

  useEffect(() => {
    if (!isFlipping) return;

    const timeout = setTimeout(() => {
      setIsFlipping(false);
      setLeftReady(false);
      setRightReady(false);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [isFlipping]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#9e2cf3] to-[#f0008c] text-white">
      <div className="mx-auto w-full max-w-md px-5 py-6">
        <div className="mb-8 flex items-center gap-4 border-b border-white/20 pb-5">
          <Link
            href="/games"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15"
          >
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-3xl font-bold">Coin Flip</h1>
        </div>

        <div className="mb-4 text-center">
          <div className="text-sm uppercase tracking-[0.2em] text-white/75">
            {isFlipping ? "Flipping..." : "Waiting for ready"}
          </div>
          {winnerSide && !isFlipping && (
            <div className="mt-2 text-2xl font-bold">
              Winner: {winnerSide.toUpperCase()}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-center">
          <CoinflipWheel rotationDeg={rotationDeg} />
        </div>

        <div className="mt-8 rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-extrabold">Player 1</div>
              <div className="mt-1 text-white/75">150 TON</div>
              <div className="mt-2 text-sm">{leftReady ? "Ready" : "Not ready"}</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold">Player 2</div>
              <div className="mt-1 text-white/75">150 TON</div>
              <div className="mt-2 text-sm">{rightReady ? "Ready" : "Not ready"}</div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <button
            onClick={() => setLeftReady((v) => !v)}
            disabled={isFlipping}
            className="rounded-3xl bg-white/15 px-4 py-6 font-bold backdrop-blur-sm disabled:opacity-50"
          >
            HEADS — {leftReady ? "READY" : "READY?"}
          </button>

          <button
            onClick={() => setRightReady((v) => !v)}
            disabled={isFlipping}
            className="rounded-3xl bg-white/15 px-4 py-6 font-bold backdrop-blur-sm disabled:opacity-50"
          >
            TAILS — {rightReady ? "READY" : "READY?"}
          </button>
        </div>

        <button
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-3xl bg-white px-6 py-5 text-xl font-bold text-[#a020f0]"
        >
          <Gift className="h-6 w-6" />
          Add Gift
        </button>
      </div>
    </main>
  );
}