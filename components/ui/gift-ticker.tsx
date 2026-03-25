"use client";

import Image from "next/image";

const gifts = [
  "/images/01.png",
  "/images/02.png",
  "/images/03.png",
  "/images/07.png",
  "/images/08.png",
  "/images/09.png",
  "/images/10.png",
  "/images/11.png",
  "/images/12.png",
  "/images/13.png",
];

const loopedGifts = [...gifts, ...gifts];

export default function GiftTicker() {
  return (
    <div className="relative w-full overflow-hidden py-6">

      {/* blur / fade края */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-[#0b84c6] to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-[#0b84c6] to-transparent" />

      <div className="gift-ticker-track flex w-max gap-6">
        {loopedGifts.map((src, index) => (
          <div
            key={`${src}-${index}`}
            className="
            flex h-36 w-36 shrink-0 items-center justify-center
            rounded-3xl
            bg-white/10
            border border-white/10
            backdrop-blur-md
            shadow-[0_0_25px_rgba(255,255,255,0.15)]
            "
          >
            <Image
              src={src}
              alt={`Gift ${index}`}
              width={110}
              height={110}
              className="
              object-contain
              drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]
              "
              priority={index < 6}
              unoptimized
            />
          </div>
        ))}
      </div>
    </div>
  );
}