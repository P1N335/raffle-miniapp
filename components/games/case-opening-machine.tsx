"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Package2, Sparkles } from "lucide-react";
import {
  useTonAddress,
  useTonConnectModal,
  useTonConnectUI,
  useTonWallet,
} from "@tonconnect/ui-react";
import { useTelegramAuth } from "@/app/hooks/useTelegramAuth";
import { useTonWalletBalance } from "@/app/hooks/useTonWalletBalance";
import {
  createCasePaymentIntent,
  fetchCasePaymentIntentStatus,
  submitCasePaymentIntent,
} from "@/app/lib/cases-api";
import type { CaseDefinition, CaseOpeningResult, CaseReward } from "@/app/lib/cases";

const CARD_WIDTH = 116;
const CARD_GAP = 14;
const SPIN_DURATION_MS = 4600;
const PAYMENT_STATUS_ATTEMPTS = 12;
const PAYMENT_STATUS_DELAY_MS = 2000;

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
  const { user } = useTelegramAuth();
  const wallet = useTonWallet();
  const walletAddress = useTonAddress(true);
  const { open } = useTonConnectModal();
  const [tonConnectUI] = useTonConnectUI();
  const { balance } = useTonWalletBalance(walletAddress);

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
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    setRailItems(previewRail);
    setTranslateX(0);
    setSelectedReward(null);
    setError(null);
    setStatusMessage(null);
  }, [previewRail]);

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

  async function openCase() {
    if (isOpening) {
      return;
    }

    if (!wallet || !walletAddress) {
      setError("Connect your TON wallet before opening the case");
      setStatusMessage(null);
      open();
      return;
    }

    const numericBalance = balance ? Number(balance.balanceTon) : null;

    if (numericBalance !== null && numericBalance < caseData.priceTon) {
      setError(`You need at least ${caseData.priceTon} TON to open this case`);
      setStatusMessage(null);
      return;
    }

    setIsOpening(true);
    setError(null);
    setSelectedReward(null);
    setStatusMessage("Preparing TON payment...");

    try {
      const intentPayload = await createCasePaymentIntent({
        slug: caseData.slug,
        walletAddress,
        userId: user?.id ?? undefined,
      });

      setStatusMessage("Confirm the TON payment in your wallet...");
      const transactionResult = await tonConnectUI.sendTransaction(
        intentPayload.transaction
      );

      setStatusMessage("Checking the blockchain and locking your reward...");
      await submitCasePaymentIntent(intentPayload.paymentIntent.id, transactionResult?.boc);

      const verifiedOpening = await waitForConfirmedOpening(intentPayload.paymentIntent.id);

      if (!verifiedOpening.reward) {
        throw new Error(
          "TON payment was submitted, but the reward is not confirmed yet. Try reopening the case page in a few seconds."
        );
      }

      const winningReward =
        caseData.rewards.find((reward) => reward.id === verifiedOpening.reward?.id) ??
        verifiedOpening.reward;

      const { items, targetIndex } = createSpinRail(caseData.rewards, winningReward);

      if (spinTimeoutRef.current !== null) {
        window.clearTimeout(spinTimeoutRef.current);
      }

      setStatusMessage("Opening your case...");
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
        setStatusMessage(null);
      }, SPIN_DURATION_MS + 120);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to open case with TON wallet";

      if (message.toLowerCase().includes("reject")) {
        setError("TON payment was cancelled in the wallet");
      } else {
        setError(message);
      }

      setStatusMessage(null);
      setIsOpening(false);
    }
  }

  async function waitForConfirmedOpening(intentId: string) {
    for (let attempt = 0; attempt < PAYMENT_STATUS_ATTEMPTS; attempt += 1) {
      const status = await fetchCasePaymentIntentStatus(intentId);

      if (status.reward && status.opening) {
        return status;
      }

      if (status.paymentIntent.status === "expired") {
        throw new Error("TON payment expired before confirmation");
      }

      if (status.paymentIntent.status === "failed") {
        throw new Error("TON payment verification failed");
      }

      await wait(PAYMENT_STATUS_DELAY_MS);
    }

    throw new Error(
      "TON payment is still waiting for blockchain confirmation. Please check again in a few seconds."
    );
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
        {isOpening ? "Processing TON payment..." : `Pay ${caseData.priceTon} TON & Open Case`}
      </button>

      {statusMessage && (
        <div className="mt-5 rounded-[1.4rem] border border-sky-300/20 bg-sky-500/10 px-4 py-3 text-center text-sm text-sky-100">
          {statusMessage}
        </div>
      )}

      {error && (
        <div className="mt-5 rounded-[1.4rem] border border-rose-300/20 bg-rose-500/10 px-4 py-3 text-center text-sm text-rose-100">
          {error}
        </div>
      )}

      {selectedReward && (
        <div className="mt-5 rounded-[1.6rem] border border-emerald-400/25 bg-emerald-500/10 px-5 py-4 text-center text-white shadow-[0_10px_30px_rgba(16,185,129,0.2)]">
          <div className="text-xs uppercase tracking-[0.24em] text-emerald-200/80">
            Prize Unlocked
          </div>
          <div className="mt-2 text-2xl font-extrabold">{selectedReward.name}</div>
          <div className="mt-1 text-sm text-emerald-100/80">{selectedReward.valueLabel}</div>
          <div className="mt-2 text-xs uppercase tracking-[0.18em] text-emerald-100/70">
            Item ID: {selectedReward.id}
          </div>
          <div className="mt-1 text-sm text-emerald-100/80">
            Estimated value: {selectedReward.estimatedValueTon} TON
          </div>
        </div>
      )}

      <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-white/[0.06] px-5 py-4 text-sm text-white/80">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-300" />
          Each case is paid from TON Wallet and only opens after backend verification
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
              key={reward.dropId}
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
                  <div className="mt-1 text-[11px] uppercase tracking-[0.16em] opacity-70">
                    Item ID: {reward.id}
                  </div>
                </div>
              </div>

              <div className="text-right" style={{ color: reward.textColor }}>
                <div className="text-base font-extrabold">{reward.chance}%</div>
                <div className="text-xs font-semibold uppercase tracking-[0.16em] opacity-75">
                  {rarityLabels[reward.rarity]}
                </div>
                <div className="mt-1 text-xs opacity-75">{reward.estimatedValueTon} TON</div>
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

function getTargetOffset(targetIndex: number, viewportWidth: number) {
  const cardFootprint = CARD_WIDTH + CARD_GAP;
  const centeredOffset = targetIndex * cardFootprint - (viewportWidth - CARD_WIDTH) / 2;

  return Math.max(centeredOffset, 0);
}

function wait(delayMs: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, delayMs);
  });
}
