"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, Lightbulb, Package2, Ticket, Trophy } from "lucide-react";
import Link from "next/link";
import { fetchCasesCatalog } from "@/app/lib/cases-api";

type Stat = {
  label: string;
  value: string;
  valueClassName?: string;
};

function GameCard({
  title,
  subtitle,
  buttonText,
  icon,
  iconClassName,
  buttonClassName,
  href,
  stats,
}: {
  title: string;
  subtitle: string;
  buttonText: string;
  icon: React.ReactNode;
  iconClassName: string;
  buttonClassName: string;
  href: string;
  stats: Stat[];
}) {
  return (
    <div className="rounded-3xl bg-white p-6 text-black shadow-sm">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl text-white ${iconClassName}`}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-extrabold">{title}</h2>
          <p className="mt-1 text-lg text-slate-600">{subtitle}</p>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-lg">
            {stats.map((stat) => (
              <span key={stat.label}>
                {stat.label}:{" "}
                <b className={stat.valueClassName ?? "text-black"}>{stat.value}</b>
              </span>
            ))}
          </div>
        </div>
      </div>

      <Link
        href={href}
        className={`mt-6 block w-full rounded-2xl px-4 py-4 text-center text-lg font-bold text-white ${buttonClassName}`}
      >
        {buttonText}
      </Link>
    </div>
  );
}

export default function GamesPage() {
  const [casesOverview, setCasesOverview] = useState({
    count: 0,
    minPriceTon: 0,
  });

  useEffect(() => {
    const loadCasesOverview = async () => {
      try {
        const cases = await fetchCasesCatalog();

        if (cases.length === 0) {
          setCasesOverview({
            count: 0,
            minPriceTon: 0,
          });
          return;
        }

        setCasesOverview({
          count: cases.length,
          minPriceTon: Math.min(...cases.map((caseItem) => caseItem.priceTon)),
        });
      } catch {
        setCasesOverview({
          count: 0,
          minPriceTon: 0,
        });
      }
    };

    loadCasesOverview();
  }, []);

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-5 py-6 text-white">
      <div className="mb-8 flex items-center gap-4 border-b border-white/20 pb-5">
        <Link
          href="/"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15"
        >
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-3xl font-bold">Games</h1>
      </div>

      <p className="mb-6 text-center text-lg text-white/90">
        Choose a game to participate in raffles
      </p>

      <div className="space-y-5">
        <GameCard
          title="Lucky Raffle"
          subtitle="Daily raffle with amazing prizes"
          buttonText="Enter Raffle"
          icon={<Ticket className="h-7 w-7" />}
          iconClassName="bg-orange-400"
          buttonClassName="bg-sky-500"
          href="/games/raffle"
          stats={[
            { label: "Prize Pool", value: "1000 TON", valueClassName: "text-sky-600" },
            { label: "Entries", value: "2,547" },
          ]}
        />

        <GameCard
          title="Coin Flip"
          subtitle="50/50 chance to win premium prizes"
          buttonText="Play Coin Flip"
          icon={<Trophy className="h-7 w-7" />}
          iconClassName="bg-gradient-to-br from-violet-500 to-pink-500"
          buttonClassName="bg-gradient-to-r from-violet-500 to-pink-500"
          href="/games/coinflip"
          stats={[
            { label: "Prize Pool", value: "5000 TON", valueClassName: "text-sky-600" },
            { label: "Entries", value: "847" },
          ]}
        />

        <GameCard
          title="Cases"
          subtitle="Open cases to win exclusive items"
          buttonText="Browse Cases"
          icon={<Package2 className="h-7 w-7" />}
          iconClassName="bg-gradient-to-br from-cyan-500 to-teal-400"
          buttonClassName="bg-gradient-to-r from-teal-500 to-cyan-500"
          href="/games/cases"
          stats={[
            {
              label: "Available",
              value: casesOverview.count ? `${casesOverview.count} Cases` : "Loading...",
              valueClassName: "text-sky-600",
            },
            {
              label: "From",
              value: casesOverview.minPriceTon
                ? `${casesOverview.minPriceTon} TON`
                : "Loading...",
            },
          ]}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-base text-white/90">
        <div className="flex items-center gap-3">
          <Lightbulb className="h-5 w-5 text-amber-300" />
          Enter raffles to win Telegram presents and TON rewards
        </div>
      </div>
    </main>
  );
}
