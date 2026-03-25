"use client";

type RafflePlayer = {
  id: number;
  username: string;
  amount: number;
  color: string;
};

type Props = {
  players: RafflePlayer[];
  rotationDeg: number;
};

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number
) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArcSlice(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}

export default function RaffleWheel({ players, rotationDeg }: Props) {
  const size = 360;
  const center = size / 2;
  const radius = 170;
  const total = players.reduce((sum, p) => sum + p.amount, 0);

  let currentAngle = 0;

  const slices = players.map((player) => {
    const percent = total > 0 ? (player.amount / total) * 100 : 0;
    const sliceAngle = (percent / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    const midAngle = startAngle + sliceAngle / 2;

    const labelRadius = 105;
    const label = polarToCartesian(center, center, labelRadius, midAngle);

    const slice = {
      ...player,
      percent,
      startAngle,
      endAngle,
      midAngle,
      path: describeArcSlice(center, center, radius, startAngle, endAngle),
      labelX: label.x,
      labelY: label.y,
    };

    currentAngle += sliceAngle;
    return slice;
  });

  return (
    <div className="relative mx-auto w-[360px]">
      <div className="absolute left-1/2 top-[-18px] z-20 h-0 w-0 -translate-x-1/2 border-l-[18px] border-r-[18px] border-b-[28px] border-l-transparent border-r-transparent border-b-white" />

      <div
        className="relative rounded-full transition-transform duration-[10000ms] ease-out"
        style={{ transform: `rotate(${rotationDeg}deg)` }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={center}
            cy={center}
            r={radius + 6}
            fill="white"
            opacity="0.95"
          />

          {slices.map((slice) => (
            <g key={slice.id}>
              <path d={slice.path} fill={slice.color} stroke="white" strokeWidth="3" />

              <text
                x={slice.labelX}
                y={slice.labelY - 8}
                fill="white"
                fontSize="13"
                fontWeight="700"
                textAnchor="middle"
                transform={`rotate(${slice.midAngle} ${slice.labelX} ${slice.labelY})`}
              >
                {slice.username}
              </text>

              <text
                x={slice.labelX}
                y={slice.labelY + 12}
                fill="white"
                fontSize="12"
                fontWeight="600"
                textAnchor="middle"
                transform={`rotate(${slice.midAngle} ${slice.labelX} ${slice.labelY})`}
              >
                {slice.percent.toFixed(1)}%
              </text>
            </g>
          ))}

          <circle cx={center} cy={center} r="48" fill="white" />
          <text
            x={center}
            y={center - 2}
            textAnchor="middle"
            fill="#0b84c6"
            fontSize="16"
            fontWeight="800"
          >
            RAFFLE
          </text>
          <text
            x={center}
            y={center + 18}
            textAnchor="middle"
            fill="#0b84c6"
            fontSize="12"
            fontWeight="700"
          >
            WHEEL
          </text>
        </svg>
      </div>
    </div>
  );
}