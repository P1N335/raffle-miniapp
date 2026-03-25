import { ChevronLeft, Ticket, Trophy } from "lucide-react";
import Link from "next/link";

function RaffleCard({
  title,
  subtitle,
  prizePool,
  entries,
  buttonText,
  icon,
  buttonClassName,
  href,
}: {
  title: string;
  subtitle: string;
  prizePool: string;
  entries: string;
  buttonText: string;
  icon: React.ReactNode;
  buttonClassName: string;
  href: string;
}) {
  return (
    <div className="rounded-3xl bg-white p-6 text-black shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-400 text-white">
          {icon}
        </div>

        <div>
          <h2 className="text-2xl font-extrabold">{title}</h2>
          <p className="mt-1 text-lg text-slate-600">{subtitle}</p>
          <div className="mt-4 flex gap-6 text-lg">
            <span>
              Prize Pool: <b className="text-sky-600">{prizePool}</b>
            </span>
            <span>
              Entries: <b>{entries}</b>
            </span>
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
        <RaffleCard
          title="Lucky Raffle"
          subtitle="Daily raffle with amazing prizes"
          prizePool="1000 TON"
          entries="2,547"
          buttonText="Enter Raffle"
          icon={<Ticket className="h-7 w-7" />}
          buttonClassName="bg-sky-500"
          href="/games/raffle"
        />

        <RaffleCard
          title="Coin Flip"
          subtitle="Two players, one winner"
          prizePool="5000 TON"
          entries="847"
          buttonText="Enter Coin Flip"
          icon={<Trophy className="h-7 w-7" />}
          buttonClassName="bg-gradient-to-r from-violet-500 to-pink-500"
          href="/games/coinflip"
        />
      </div>

      <div className="mt-6 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-base text-white/90">
        💡 Enter games to win Telegram presents and TON rewards
      </div>
    </main>
  );
}