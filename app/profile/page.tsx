"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  Copy,
  Crown,
  Gem,
  History,
  Package2,
  WalletCards,
} from "lucide-react";
import { useTelegramAuth } from "@/app/hooks/useTelegramAuth";
import { fetchUserProfile } from "@/app/lib/profile-api";
import type { ProfileHistoryEntry, ProfileInventoryItem, UserProfilePayload } from "@/app/lib/profile";

const statusLabels: Record<ProfileHistoryEntry["status"], string> = {
  owned: "In inventory",
  in_coinflip: "Locked in CoinFlip",
  sold: "Sold",
  withdraw_pending: "Withdraw requested",
  withdrawn: "Withdrawn",
};

export default function ProfilePage() {
  const { user, loading, error } = useTelegramAuth();
  const userId = user?.id ?? null;
  const [profile, setProfile] = useState<UserProfilePayload | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!userId) {
      setProfile(null);
      setProfileLoading(false);
      setProfileError(user ? "User id is not available" : "Profile is unavailable");
      return;
    }

    let cancelled = false;

    const loadProfile = async () => {
      setProfileLoading(true);

      try {
        const payload = await fetchUserProfile(userId);

        if (!cancelled) {
          setProfile(payload);
          setProfileError(null);
        }
      } catch (error) {
        if (!cancelled) {
          setProfileError(error instanceof Error ? error.message : "Failed to load profile");
        }
      } finally {
        if (!cancelled) {
          setProfileLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [loading, user, userId]);

  const profileUser = profile?.user ?? user;
  const displayName = profileUser?.username
    ? `@${profileUser.username}`
    : profileUser?.firstName ?? "Telegram User";

  const subtitle =
    [profileUser?.firstName, profileUser?.lastName].filter(Boolean).join(" ") ||
    "Mini App User";

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

      <div className="rounded-3xl bg-white p-6 text-black shadow-sm">
        {loading || profileLoading ? (
          <div className="animate-pulse">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-slate-200" />
              <div className="flex-1">
                <div className="h-7 w-40 rounded-full bg-slate-200" />
                <div className="mt-3 h-5 w-28 rounded-full bg-slate-100" />
              </div>
            </div>
            <div className="mt-6 h-20 rounded-2xl bg-slate-100" />
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 rounded-2xl bg-amber-100 px-4 py-3 text-sm text-amber-900">
                Auth warning: {error}
              </div>
            )}

            {profileError && (
              <div className="mb-4 rounded-2xl bg-rose-100 px-4 py-3 text-sm text-rose-900">
                {profileError}
              </div>
            )}

            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-sky-600 text-white">
                {profileUser?.photoUrl ? (
                  <Image
                    src={profileUser.photoUrl}
                    alt={displayName}
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-2xl font-bold">
                    {profileUser?.firstName?.[0]?.toUpperCase() ?? "U"}
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <div className="truncate text-2xl font-extrabold">{displayName}</div>
                <div className="text-lg text-slate-500">{subtitle}</div>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              <div className="flex items-center justify-between rounded-2xl bg-slate-100 px-4 py-4">
                <div>
                  <div className="text-sm text-slate-500">Telegram ID</div>
                  <div className="mt-1 text-xl font-bold">{profileUser?.telegramId ?? "-"}</div>
                </div>

                <button
                  onClick={() => {
                    if (profileUser?.telegramId) {
                      navigator.clipboard.writeText(profileUser.telegramId);
                    }
                  }}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600"
                >
                  <Copy className="h-5 w-5" />
                </button>
              </div>

              <div className="rounded-2xl bg-slate-100 px-4 py-4">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <WalletCards className="h-4 w-4" />
                  TON Wallet
                </div>
                <div className="mt-2 break-all text-base font-bold text-slate-900">
                  {profile?.user.tonWalletAddress ?? "Wallet is not connected yet"}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {profile && (
        <>
          <section className="mt-6">
            <div className="grid grid-cols-2 gap-3">
              <SummaryCard
                icon={<Gem className="h-5 w-5 text-cyan-100" />}
                title="Total won"
                value={`${profile.summary.totalWonTon} TON`}
                subtitle={`${profile.summary.totalItemsWon} gifts`}
                gradient="linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)"
              />
              <SummaryCard
                icon={<Package2 className="h-5 w-5 text-emerald-100" />}
                title="Inventory"
                value={`${profile.summary.activeInventoryCount}`}
                subtitle="available gifts"
                gradient="linear-gradient(135deg, #10b981 0%, #14b8a6 100%)"
              />
              <SummaryCard
                icon={<WalletCards className="h-5 w-5 text-fuchsia-100" />}
                title="Total sold"
                value={`${profile.summary.totalSoldTon} TON`}
                subtitle="from sold gifts"
                gradient="linear-gradient(135deg, #a855f7 0%, #ec4899 100%)"
              />
              <SummaryCard
                icon={<Crown className="h-5 w-5 text-amber-100" />}
                title="Best drop"
                value={
                  profile.summary.mostExpensiveGift
                    ? `${profile.summary.mostExpensiveGift.reward.estimatedValueTon} TON`
                    : "No gifts"
                }
                subtitle={profile.summary.mostExpensiveGift?.reward.name ?? "Play cases"}
                gradient="linear-gradient(135deg, #f59e0b 0%, #f97316 100%)"
              />
            </div>
          </section>

          <section className="mt-8">
            <div className="mb-4 flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-white/65">
              <Package2 className="h-4 w-4" />
              Inventory
            </div>

            {profile.inventory.length === 0 ? (
              <div className="rounded-3xl border border-white/15 bg-white/8 px-5 py-6 text-center text-white/75">
                No gifts in inventory yet. Open a case to start collecting items.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {profile.inventory.map((item) => (
                  <InventoryCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </section>

          <section className="mt-8 pb-8">
            <div className="mb-4 flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-white/65">
              <History className="h-4 w-4" />
              Opening History
            </div>

            <div className="space-y-3">
              {profile.openingHistory.length === 0 ? (
                <div className="rounded-3xl border border-white/15 bg-white/8 px-5 py-6 text-center text-white/75">
                  Your case openings will appear here.
                </div>
              ) : (
                profile.openingHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-3xl border border-white/10 bg-white/8 px-4 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                        <Image
                          src={entry.reward.image}
                          alt={entry.reward.name}
                          width={52}
                          height={52}
                          className="h-11 w-11 object-contain"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="truncate text-lg font-extrabold text-white">
                          {entry.reward.name}
                        </div>
                        <div className="text-sm text-white/65">{entry.case.name}</div>
                      </div>

                      <div className="text-right">
                        <div className="text-base font-extrabold text-white">
                          {entry.reward.estimatedValueTon} TON
                        </div>
                        <div className="text-xs uppercase tracking-[0.16em] text-white/55">
                          {statusLabels[entry.status]}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function SummaryCard({
  icon,
  title,
  value,
  subtitle,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  gradient: string;
}) {
  return (
    <div
      className="rounded-3xl px-4 py-4 text-white shadow-[0_18px_40px_rgba(0,0,0,0.18)]"
      style={{ backgroundImage: gradient }}
    >
      <div className="flex items-center gap-2 text-sm text-white/80">{icon}{title}</div>
      <div className="mt-3 text-2xl font-extrabold">{value}</div>
      <div className="mt-1 text-sm text-white/80">{subtitle}</div>
    </div>
  );
}

function InventoryCard({ item }: { item: ProfileInventoryItem }) {
  return (
    <Link
      href={`/profile/inventory/${item.id}`}
      className="rounded-3xl border border-white/10 bg-white/8 p-4 text-white shadow-[0_16px_30px_rgba(0,0,0,0.12)] transition active:scale-[0.99]"
    >
      <div
        className="flex h-28 items-center justify-center rounded-[1.4rem]"
        style={{ backgroundImage: item.reward.accent }}
      >
        <Image
          src={item.reward.image}
          alt={item.reward.name}
          width={92}
          height={92}
          className="h-20 w-20 object-contain drop-shadow-[0_14px_16px_rgba(0,0,0,0.18)]"
        />
      </div>

      <div className="mt-4 text-lg font-extrabold">{item.reward.name}</div>
      <div className="mt-1 text-sm text-white/65">{item.reward.valueLabel}</div>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-white/55">Sell value</span>
        <span className="font-bold text-emerald-300">{item.reward.estimatedValueTon} TON</span>
      </div>
    </Link>
  );
}
