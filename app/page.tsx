import { Gamepad2, ChevronRight, User } from "lucide-react";
import Link from "next/link";
import GiftTicker from "@/components/ui/gift-ticker";

function MenuCard({
  href,
  icon,
  title,
  subtitle,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-3xl bg-white px-6 py-6 text-black shadow-sm transition active:scale-[0.99]"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 text-sky-600">
          {icon}
        </div>

        <div>
          <div className="text-2xl font-bold">{title}</div>
          <div className="text-lg text-slate-500">{subtitle}</div>
        </div>
      </div>

      <ChevronRight className="h-7 w-7 text-slate-400" />
    </Link>
  );
}

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center px-6 py-10">
      <div className="mt-6 w-full">
        <GiftTicker />
      </div>

      <h1 className="mt-4 text-center text-4xl font-extrabold">
        Gifts Battle
      </h1>

      <p className="mt-3 text-center text-xl text-white/85">
        Win amazing prizes on Telegram
      </p>

      <div className="mt-10 flex w-full flex-col gap-4">
        <MenuCard
          href="/games"
          icon={<Gamepad2 className="h-7 w-7" />}
          title="Games"
          subtitle="Play and win prizes"
        />

        <MenuCard
          href="/profile"
          icon={<User className="h-7 w-7" />}
          title="Profile"
          subtitle="View your stats"
        />
      </div>

      <p className="mt-10 text-base text-white/70">
        Powered by Telegram Mini App
      </p>
    </main>
  );
}