"use client";

import { useTelegramAuth } from "@/app/hooks/useTelegramAuth";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Copy } from "lucide-react";

export default function ProfilePage() {
  const { user, loading, error } = useTelegramAuth();

  const displayName = user?.username
    ? `@${user.username}`
    : user?.firstName ?? "Telegram User";

  const subtitle =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Mini App User";

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
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            {error && (
              <div className="mb-4 rounded-2xl bg-amber-100 px-4 py-3 text-sm text-amber-900">
                Auth warning: {error}
              </div>
            )}

            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-sky-600 text-white">
                {user?.photoUrl ? (
                  <Image
                    src={user.photoUrl}
                    alt={displayName}
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-2xl font-bold">
                    {user?.firstName?.[0]?.toUpperCase() ?? "U"}
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
                <div className="mt-1 text-xl font-bold">{user?.telegramId ?? "-"}</div>
              </div>

              <button
                onClick={() => {
                  if (user?.telegramId) navigator.clipboard.writeText(user.telegramId);
                }}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600"
              >
                <Copy className="h-5 w-5" />
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
