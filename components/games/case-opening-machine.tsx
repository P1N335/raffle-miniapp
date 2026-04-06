"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Package2, Sparkles } from "lucide-react";
import type { CaseDefinition, CaseReward } from "@/app/lib/cases";

const CARD_WIDTH = 116;
const CARD_GAP = 14;
const SPIN_DURATION_MS = 4600;

type ReelReward = CaseReward & {
  reelKey: string;
};

const rarityLabels: Record<CaseReward["rarity"], string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};

export function CaseOpeningMachine({ caseData }: { caseData: CaseDefinition }) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const spinTimeoutRef = useRef<number | null>(null);

  const previewRail = useMemo(
    () => createPreviewRail(caseData.rewards),
    [caseData.rewards]
  );

  const [railItems, setRailItems] = useState<ReelReward[]>(previewRail);
  const [translateX, setTranslateX] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [selectedReward, setSelectedReward] = useState<CaseReward | null>(null);

  useEffect(() => {
    const measureViewport = () => {
      setViewportWidth(viewportRef.current?.clientWidth ?? 0);
    };

    measureViewport();
    window.addEventListener("resize", measureViewport);

    return () => {
      window.removeEventListener("resize", measureViewport);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (spinTimeoutRef.current !== null) {
        window.clearTimeout(spinTimeoutRef.current);
      }
    };
  }, []);

  const possibleRewards = useMemo(
    () => [...caseData.rewards].sort((left, right) => right.chance - left.chance),
    [caseData.rewards]
  );

  function openCase() {
    if (isOpening) {
      return;
    }

    const winningReward = pickWeightedReward(caseData.rewards);
    const { items, targetIndex } = createSpinRail(caseData.rewards, winningReward);

    if (spinTimeoutRef.current !== null) {
      window.clearTimeout(spinTimeoutRef.current);
    }

    setIsOpening(true);
    setSelectedReward(null);
    setTransitionEnabled(false);
    setRailItems(items);
    setTranslateX(0);

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setTransitionEnabled(true);
        setTranslateX(getTargetOffset(targetIndex, viewportWidth));
      });
    });

    spinTimeoutRef.current = window.setTimeout(() => {
      setSelectedReward(winningReward);
      setIsOpening(false);
    }, SPIN_DURATION_MS + 120);
  }

  return (
    <>
      <div className="relative mt-8 overflow-hidden rounded-[2rem] border border-white/10 bg-[#111b31] px-3 pb-3 pt-8 shadow-[0_30px_80px_rgba(0,0,0,0.3)]">
        <div className="pointer-events-none absolute left-1/2 top-0 h-0 w-0 -translate-x-1/2 border-x-[13px] border-t-[24px] border-x-transparent border-t-[#ffbe0b]" />

        <div ref={viewportRef} className="overflow-hidden rounded-[1.5rem] bg-[#19253d] px-3 py-6">
          <div
            className="flex"
            style={{
              gap: `${CARD_GAP}px`,
              transform: `translateX(-${translateX}px)`,
              transitionDuration: transitionEnabled ? `${SPIN_DURATION_MS}ms` : "0ms",
              transitionProperty: "transform",
              transitionTimingFunction: "cubic-bezier(0.12, 0.85, 0.2, 1)",
            }}
          >
            {railItems.map((reward) => (
              <div
                key={reward.reelKey}
                className="shrink-0 rounded-[1.35rem] border border-white/20 px-3 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]"
                style={{
                  width: `${CARD_WIDTH}px`,
                  backgroundImage: reward.accent,
                  color: reward.textColor,
                }}
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/25">
                  <Image
                    src={reward.image}
                    alt={reward.name}
                    width={60}
                    height={60}
                    className="h-14 w-14 object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.2)]"
                  />
                </div>

                <div className="mt-4 text-center text-[15px] font-extrabold leading-tight">
                  {reward.name}
                </div>
                <div className="mt-1 text-center text-xs font-semibold opacity-80">
                  {rarityLabels[reward.rarity]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={openCase}
        disabled={isOpening}
        className="mt-8 w-full rounded-[1.6rem] px-6 py-5 text-lg font-extrabold text-white shadow-[0_16px_40px_rgba(151,56,255,0.3)] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
        style={{ backgroundImage: caseData.buttonGradient }}
      >
        {isOpening ? "Opening..." : `Open Case for ${caseData.priceTon} TON`}
      </button>

      {selectedReward && (
        <div className="mt-5 rounded-[1.6rem] border border-emerald-400/25 bg-emerald-500/10 px-5 py-4 text-center text-white shadow-[0_10px_30px_rgba(16,185,129,0.2)]">
          <div className="text-xs uppercase tracking-[0.24em] text-emerald-200/80">
            Prize Unlocked
          </div>
          <div className="mt-2 text-2xl font-extrabold">{selectedReward.name}</div>
          <div className="mt-1 text-sm text-emerald-100/80">{selectedReward.valueLabel}</div>
        </div>
      )}

      <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-white/[0.06] px-5 py-4 text-sm text-white/80">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-300" />
          Each case contains random items with different rarities
        </div>
      </div>

      <div className="mt-8 rounded-[1.8rem] border border-white/10 bg-white/[0.06] p-4">
        <div className="mb-4 flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-white/55">
          <Package2 className="h-4 w-4" />
          Possible Rewards
        </div>

        <div className="space-y-3">
          {possibleRewards.map((reward) => (
            <div
              key={reward.id}
              className="flex items-center justify-between rounded-[1.3rem] border border-white/[0.08] px-4 py-3"
              style={{ backgroundImage: reward.accent }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/35">
                  <Image
                    src={reward.image}
                    alt={reward.name}
                    width={52}
                    height={52}
                    className="h-11 w-11 object-contain"
                  />
                </div>

                <div style={{ color: reward.textColor }}>
                  <div className="text-base font-extrabold">{reward.name}</div>
                  <div className="text-sm opacity-80">{reward.valueLabel}</div>
                </div>
              </div>

              <div className="text-right" style={{ color: reward.textColor }}>
                <div className="text-base font-extrabold">{reward.chance}%</div>
                <div className="text-xs font-semibold uppercase tracking-[0.16em] opacity-75">
                  {rarityLabels[reward.rarity]}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function createPreviewRail(rewards: CaseReward[]): ReelReward[] {
  return Array.from({ length: 18 }, (_, index) => {
    const reward = rewards[index % rewards.length];

    return {
      ...reward,
      reelKey: `${reward.id}-preview-${index}`,
    };
  });
}

function createSpinRail(rewards: CaseReward[], winningReward: CaseReward) {
  const items = Array.from({ length: 32 }, (_, index) => {
    const reward = rewards[(index * 3 + 1) % rewards.length];

    return {
      ...reward,
      reelKey: `${reward.id}-spin-${index}`,
    };
  });

  const targetIndex = 24;
  items[targetIndex] = {
    ...winningReward,
    reelKey: `${winningReward.id}-winner-${targetIndex}`,
  };

  return { items, targetIndex };
}

function pickWeightedReward(rewards: CaseReward[]) {
  const totalChance = rewards.reduce((sum, reward) => sum + reward.chance, 0);
  let random = Math.random() * totalChance;

  for (const reward of rewards) {
    random -= reward.chance;
    if (random <= 0) {
      return reward;
    }
  }

  return rewards[rewards.length - 1];
}

function getTargetOffset(targetIndex: number, viewportWidth: number) {
  const cardFootprint = CARD_WIDTH + CARD_GAP;
  const centeredOffset = targetIndex * cardFootprint - (viewportWidth - CARD_WIDTH) / 2;

  return Math.max(centeredOffset, 0);
}
