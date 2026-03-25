"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Gift } from "lucide-react";
import RaffleWheel from "@/components/games/raffle-wheel";

type Phase = "betting" | "spinning";

const BETTING_SECONDS = 60;
const SPINNING_SECONDS = 10;

const initialPlayers = [
  { id: 1, username: "@alex", amount: 120, color: "#ff6b6b" },
  { id: 2, username: "@mike", amount: 80, color: "#4ecdc4" },
  { id: 3, username: "@lena", amount: 60, color: "#45b7d1" },
  { id: 4, username: "@roman", amount: 45, color: "#f7a072" },
  { id: 5, username: "@tony", amount: 95, color: "#8fd3c1" },
];

export default function RaffleGamePage() {
  const [players, setPlayers] = useState(initialPlayers);
  const [phase, setPhase] = useState<Phase>("betting");
  const [secondsLeft, setSecondsLeft] = useState(BETTING_SECONDS);
  const [rotationDeg, setRotationDeg] = useState(0);
  const [winnerName, setWinnerName] = useState<string | null>(null);

  const totalPool = useMemo(
    () => players.reduce((sum, p) => sum + p.amount, 0),
    [players]
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;

        if (phase === "betting") {
          const winner = pickWeightedWinner(players);
          setWinnerName(winner.username);

          const targetDeg = calculateWinningRotation(players, winner.id);
          setRotationDeg((prevRotation) => prevRotation - (3600 + targetDeg));

          setPhase("spinning");
          return SPINNING_SECONDS;
        }

        setPhase("betting");
        setWinnerName(null);
        return BETTING_SECONDS;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, players]);

  function addMockGift() {
    const usernames = ["@neo", "@flash", "@eva", "@nick", "@marta"];
    const colors = ["#f4b942", "#7b61ff", "#ff7aa2", "#58c27d", "#52b6ff"];
    const randomAmount = Math.floor(Math.random() * 90) + 20;

    setPlayers((prev) => [
      ...prev,
      {
        id: Date.now(),
        username: usernames[Math.floor(Math.random() * usernames.length)],
        amount: randomAmount,
        color: colors[Math.floor(Math.random() * colors.length)],
      },
    ]);
  }

  return (
    <main className="min-h-screen bg-[#0b84c6] text-white">
      <div className="mx-auto w-full max-w-md px-5 py-6">
        <div className="mb-8 flex items-center gap-4 border-b border-white/20 pb-5">
          <Link
            href="/games"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15"
          >
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-3xl font-bold">Lucky Raffle</h1>
        </div>

        <div className="mb-4 text-center">
          <div className="text-sm uppercase tracking-[0.2em] text-white/75">
            {phase === "betting" ? "Accepting bets" : "Spinning"}
          </div>
          <div className="mt-2 text-4xl font-extrabold">{secondsLeft}s</div>
          {winnerName && phase === "spinning" && (
            <div className="mt-2 text-lg text-white/90">Winner: {winnerName}</div>
          )}
        </div>

        <div className="mt-6 flex justify-center">
          <RaffleWheel players={players} rotationDeg={rotationDeg} />
        </div>

        <div className="mt-8 rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-4xl font-extrabold">{players.length}</div>
              <div className="mt-1 text-white/75">Players</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold">{totalPool} TON</div>
              <div className="mt-1 text-white/75">Prize Pool</div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl bg-white p-5 text-black">
          <h2 className="text-2xl font-bold">Participants</h2>
          <div className="mt-4 space-y-3">
            {players.map((player) => {
              const percent = (player.amount / totalPool) * 100;
              return (
                <div
                  key={player.id}
                  className="flex items-center justify-between rounded-2xl bg-slate-100 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: player.color }}
                    />
                    <div>
                      <div className="font-bold">{player.username}</div>
                      <div className="text-sm text-slate-500">
                        {player.amount} TON
                      </div>
                    </div>
                  </div>
                  <div className="font-semibold text-slate-700">
                    {percent.toFixed(1)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={addMockGift}
          disabled={phase !== "betting"}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-3xl bg-white px-6 py-5 text-xl font-bold text-[#0b84c6] disabled:opacity-50"
        >
          <Gift className="h-6 w-6" />
          Add Gift
        </button>
      </div>
    </main>
  );
}

function pickWeightedWinner(players: { id: number; amount: number; username: string }[]) {
  const total = players.reduce((sum, p) => sum + p.amount, 0);
  let random = Math.random() * total;

  for (const player of players) {
    random -= player.amount;
    if (random <= 0) return player;
  }

  return players[players.length - 1];
}

function calculateWinningRotation(
  players: { id: number; amount: number }[],
  winnerId: number
) {
  const total = players.reduce((sum, p) => sum + p.amount, 0);
  let currentAngle = 0;

  for (const player of players) {
    const percent = (player.amount / total) * 100;
    const angle = (percent / 100) * 360;
    const start = currentAngle;
    const end = currentAngle + angle;

    if (player.id === winnerId) {
      const middle = (start + end) / 2;
      return middle;
    }

    currentAngle += angle;
  }

  return 0;
}