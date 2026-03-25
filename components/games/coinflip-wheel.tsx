"use client";

type Props = {
  rotationDeg: number;
};

export default function CoinflipWheel({ rotationDeg }: Props) {
  return (
    <div className="relative mx-auto w-[340px]">
      <div className="absolute left-1/2 top-[-18px] z-20 h-0 w-0 -translate-x-1/2 border-l-[18px] border-r-[18px] border-b-[28px] border-l-transparent border-r-transparent border-b-white" />

      <div
        className="transition-transform duration-[5000ms] ease-out"
        style={{ transform: `rotate(${rotationDeg}deg)` }}
      >
        <svg width="340" height="340" viewBox="0 0 340 340">
          <circle cx="170" cy="170" r="160" fill="white" opacity="0.95" />
          <path d="M170 170 L170 10 A160 160 0 0 1 170 330 Z" fill="#f5d000" />
          <path d="M170 170 L170 330 A160 160 0 0 1 170 10 Z" fill="#b8b8b8" />

          <circle cx="170" cy="170" r="48" fill="white" />
          <text x="170" y="164" textAnchor="middle" fill="#a020f0" fontSize="16" fontWeight="800">
            READY
          </text>
          <text x="170" y="184" textAnchor="middle" fill="#a020f0" fontSize="12" fontWeight="700">
            FLIP
          </text>

          <text
            x="170"
            y="78"
            textAnchor="middle"
            fill="#8f6d00"
            fontSize="22"
            fontWeight="800"
            transform="rotate(90 170 170)"
          >
            HEADS
          </text>

          <text
            x="170"
            y="268"
            textAnchor="middle"
            fill="#6b6b6b"
            fontSize="22"
            fontWeight="800"
            transform="rotate(90 170 170)"
          >
            TAILS
          </text>
        </svg>
      </div>
    </div>
  );
}