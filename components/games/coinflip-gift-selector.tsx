"use client";

import Image from "next/image";
import type { ProfileInventoryItem } from "@/app/lib/profile";

export default function CoinflipGiftSelector({
  items,
  selectedIds,
  onToggle,
}: {
  items: ProfileInventoryItem[];
  selectedIds: string[];
  onToggle: (openingId: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => {
        const isSelected = selectedIds.includes(item.id);

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onToggle(item.id)}
            className={`rounded-[1.5rem] border p-3 text-left text-white transition ${
              isSelected
                ? "border-emerald-300 bg-emerald-500/20 shadow-[0_0_0_1px_rgba(52,211,153,0.45)]"
                : "border-white/10 bg-white/[0.07] active:scale-[0.99]"
            }`}
          >
            <div
              className="flex h-24 items-center justify-center rounded-[1.2rem]"
              style={{ backgroundImage: item.reward.accent }}
            >
              <Image
                src={item.reward.image}
                alt={item.reward.name}
                width={80}
                height={80}
                className="h-16 w-16 object-contain drop-shadow-[0_14px_16px_rgba(0,0,0,0.18)]"
              />
            </div>

            <div className="mt-3 line-clamp-1 text-base font-extrabold">
              {item.reward.name}
            </div>
            <div className="mt-1 text-xs uppercase tracking-[0.18em] text-white/45">
              {item.reward.rarity}
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-white/55">Value</span>
              <span className="font-bold text-emerald-300">
                {item.reward.estimatedValueTon} TON
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
