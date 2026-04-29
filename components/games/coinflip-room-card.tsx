"use client";

import Image from "next/image";
import { ChevronRight, Layers3, Sparkles } from "lucide-react";
import type { CoinflipRoomSummary } from "@/app/lib/coinflip";

export default function CoinflipRoomCard({
  room,
  ownedByCurrentUser,
  onOpen,
}: {
  room: CoinflipRoomSummary;
  ownedByCurrentUser: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-[1.8rem] border border-white/10 bg-white/[0.08] p-4 text-left text-white shadow-[0_16px_34px_rgba(0,0,0,0.14)] transition active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-cyan-200/80">
            <Sparkles className="h-4 w-4" />
            {ownedByCurrentUser ? "Your room" : room.roomCode}
          </div>
          <div className="mt-2 text-2xl font-extrabold">{room.creator.displayName}</div>
          <div className="mt-1 text-sm text-white/65">
            {room.creatorGiftCount} gifts ready for a CoinFlip
          </div>
        </div>

        <div className="rounded-2xl bg-cyan-500/15 px-4 py-3 text-right">
          <div className="text-xs uppercase tracking-[0.18em] text-cyan-100/70">Room value</div>
          <div className="mt-1 text-xl font-extrabold text-cyan-100">
            {room.creatorTotalTon} TON
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {room.previewItems.map((item) => (
          <div
            key={item.id}
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10"
            style={{ backgroundImage: item.reward.accent }}
          >
            <Image
              src={item.reward.image}
              alt={item.reward.name}
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
            />
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-white/65">
          <Layers3 className="h-4 w-4" />
          Open room
        </div>
        <div className="flex items-center gap-2 font-bold text-cyan-100">
          View
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>
    </button>
  );
}
