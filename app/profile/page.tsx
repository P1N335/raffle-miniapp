"use client";

import { ChevronLeft, Copy, Ticket, Award, TrendingUp, Coins } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useTelegramUser } from "@/app/hooks/useTelegramUser";

function StatCard({
  icon,
  value,
  label,
  iconBg,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  iconBg: string;
}) {
  return (
    <div className="rounded-3xl bg-white p-6 text-black">
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconBg}`}>
        {icon}
      </div>
      <div className="mt-6 text-4xl font-bold">{value}</div>
      <div className="mt-2 text-lg text-slate-500">{label}</div>
    </div>
  );
}

export default function ProfilePage() {
  const tgUser = useTelegramUser();

  const displayName = tgUser?.username
    ? `@${tgUser.username}`
    : tgUser?.first_name ?? "Telegram User";

  const subtitle =
    [tgUser?.first_name, tgUser?.last_name].filter(Boolean).join(" ") || "Open in Telegram";

  const telegramId = tgUser?.id ? String(tgUser.id) : "—";

  const copyId = async () => {
    if (!tgUser?.id) return;
    await navigator.clipboard.writeText(String(tgUser.id));
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-5 py-6 text-white">
      <div className="mb-6 flex items-center gap-4 border-b border-white/20 pb-5">
        <Link
          href="/"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15"
        >
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-3xl font-bold">Profile</h1>
      </div>

      <div className="rounded-3xl bg-white p-6 text-black">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-sky-600 text-white">
            {tgUser?.photo_url ? (
              <Image
                src={tgUser.photo_url}
                alt={displayName}
                width={64}
                height={64}
                className="h-full w-full object-cover"
                unoptimized
              />
            ) : (
              <span className="text-2xl font-bold">
                {tgUser?.first_name?.[0]?.toUpperCase() ?? "U"}
              </span>
            )}
          </div>

          <div>
            <div className="text-2xl font-extrabold">{displayName}</div>
            <div className="text-lg text-slate-500">{subtitle}</div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between rounded-2xl bg-slate-100 px-4 py-4">
          <div>
            <div className="text-sm text-slate-500">Telegram ID</div>
            <div className="mt-1 text-xl font-bold">{telegramId}</div>
          </div>

          <button
            onClick={copyId}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600"
          >
            <Copy className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 text-center text-lg text-slate-500">
          {tgUser ? "Connected via Telegram Mini App" : "Open this page inside Telegram Mini App"}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <StatCard
          icon={<Ticket className="h-6 w-6 text-sky-600" />}
          value="127"
          label="Total Entries"
          iconBg="bg-sky-100"
        />
        <StatCard
          icon={<Award className="h-6 w-6 text-yellow-600" />}
          value="8"
          label="Wins"
          iconBg="bg-yellow-100"
        />
        <StatCard
          icon={<TrendingUp className="h-6 w-6 text-green-600" />}
          value="6.3%"
          label="Win Rate"
          iconBg="bg-green-100"
        />
        <StatCard
          icon={<Coins className="h-6 w-6 text-violet-600" />}
          value="450"
          label="TON Won"
          iconBg="bg-violet-100"
        />
      </div>
    </main>
  );
}