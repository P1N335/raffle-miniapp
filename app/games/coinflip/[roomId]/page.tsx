"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CircleAlert,
  Crown,
  Loader2,
  ShieldAlert,
  Sparkles,
  TimerReset,
  Users2,
} from "lucide-react";
import { useTelegramAuth } from "@/app/hooks/useTelegramAuth";
import {
  cancelCoinflipRoom,
  fetchCoinflipRoom,
  joinCoinflipRoom,
} from "@/app/lib/coinflip-api";
import type { CoinflipRoomDetail, CoinflipRoomItem } from "@/app/lib/coinflip";
import { fetchUserProfile } from "@/app/lib/profile-api";
import type { UserProfilePayload } from "@/app/lib/profile";
import CoinflipGiftSelector from "@/components/games/coinflip-gift-selector";

export default function CoinflipRoomPage() {
  const params = useParams<{ roomId: string }>();
  const roomId = Array.isArray(params.roomId) ? params.roomId[0] : params.roomId;
  const router = useRouter();
  const { user, loading, error } = useTelegramAuth();
  const userId = user?.id ?? null;

  const [room, setRoom] = useState<CoinflipRoomDetail | null>(null);
  const [profile, setProfile] = useState<UserProfilePayload | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!userId || !roomId) {
      setPageLoading(false);
      setPageError(
        !roomId
          ? "CoinFlip room is unavailable"
          : user
            ? "User id is not available"
            : "CoinFlip room is unavailable"
      );
      return;
    }

    let cancelled = false;

    const loadPage = async () => {
      setPageLoading(true);

      try {
        const [roomPayload, profilePayload] = await Promise.all([
          fetchCoinflipRoom(roomId),
          fetchUserProfile(userId),
        ]);

        if (!cancelled) {
          setRoom(roomPayload);
          setProfile(profilePayload);
          setPageError(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setPageError(
            loadError instanceof Error ? loadError.message : "Failed to load CoinFlip room"
          );
        }
      } finally {
        if (!cancelled) {
          setPageLoading(false);
        }
      }
    };

    loadPage();

    return () => {
      cancelled = true;
    };
  }, [loading, roomId, user, userId]);

  useEffect(() => {
    if (!roomId || room?.status !== "open") {
      return;
    }

    const interval = window.setInterval(async () => {
      try {
        const freshRoom = await fetchCoinflipRoom(roomId);
        setRoom(freshRoom);
      } catch {
        // Quietly ignore polling failures and keep the last known state.
      }
    }, 4000);

    return () => {
      window.clearInterval(interval);
    };
  }, [room?.status, roomId]);

  const inventory = profile?.inventory ?? [];
  const isCreator = room?.creator.id === userId;
  const selectedItems = useMemo(
    () => inventory.filter((item) => selectedIds.includes(item.id)),
    [inventory, selectedIds]
  );
  const selectedTotalTon = selectedItems.reduce(
    (total, item) => total + item.reward.estimatedValueTon,
    0
  );
  const selectedChancePercent =
    room && selectedTotalTon > 0
      ? Number(((selectedTotalTon / (room.creatorTotalTon + selectedTotalTon)) * 100).toFixed(2))
      : 0;
  const canConfirmJoin =
    !!room &&
    !isCreator &&
    room.status === "open" &&
    selectedIds.length > 0 &&
    selectedTotalTon >= room.joinRangeTon.min &&
    selectedTotalTon <= room.joinRangeTon.max;

  const toggleSelection = (openingId: string) => {
    setSelectedIds((current) => {
      if (current.includes(openingId)) {
        return current.filter((id) => id !== openingId);
      }

      if (current.length >= 3) {
        return current;
      }

      return [...current, openingId];
    });
  };

  const handleCancelRoom = async () => {
    if (!userId || !room) {
      return;
    }

    setIsPending(true);

    try {
      await cancelCoinflipRoom(room.id, userId);
      router.push("/games/coinflip");
    } catch (cancelError) {
      setPageError(
        cancelError instanceof Error ? cancelError.message : "Failed to cancel room"
      );
      setIsPending(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!userId || !room || !canConfirmJoin) {
      return;
    }

    setIsPending(true);

    try {
      const updatedRoom = await joinCoinflipRoom({
        roomId: room.id,
        userId,
        openingIds: selectedIds,
      });

      setRoom(updatedRoom);
      setSelectedIds([]);
      setPageError(null);
    } catch (joinError) {
      setPageError(joinError instanceof Error ? joinError.message : "Failed to join room");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#1d1739_0%,_#131b30_45%,_#09111d_100%)] text-white">
      <div className="mx-auto w-full max-w-md px-5 py-6">
        <div className="mb-8 flex items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-white/45">
              CoinFlip Room
            </div>
            <h1 className="mt-2 text-2xl font-extrabold">{room?.roomCode ?? "Loading..."}</h1>
          </div>

          <Link
            href="/games/coinflip"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded-[1.4rem] border border-amber-300/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Auth warning: {error}
          </div>
        )}

        {pageError && (
          <div className="mb-4 rounded-[1.4rem] border border-rose-300/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {pageError}
          </div>
        )}

        {pageLoading || !room ? (
          <div className="space-y-4">
            <div className="h-32 animate-pulse rounded-[1.8rem] bg-white/[0.08]" />
            <div className="h-52 animate-pulse rounded-[1.8rem] bg-white/[0.08]" />
            <div className="h-52 animate-pulse rounded-[1.8rem] bg-white/[0.08]" />
          </div>
        ) : (
          <>
            <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.08] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500">
                  <Users2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-lg font-extrabold">{room.creator.displayName}</div>
                  <div className="text-sm text-white/65">
                    {room.status === "open"
                      ? "Waiting for the second player"
                      : room.status === "finished"
                        ? "CoinFlip finished"
                        : "Room cancelled"}
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <StatCard label="Creator value" value={`${room.creatorTotalTon} TON`} />
                <StatCard
                  label="Join range"
                  value={`${room.joinRangeTon.min}-${room.joinRangeTon.max} TON`}
                />
              </div>
            </div>

            {room.status === "finished" && room.winner && (
              <div className="mt-5 rounded-[1.8rem] border border-emerald-300/20 bg-emerald-500/10 p-5">
                <div className="flex items-center gap-3 text-emerald-100">
                  <Crown className="h-6 w-6" />
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-emerald-100/70">
                      Winner
                    </div>
                    <div className="text-2xl font-extrabold">{room.winner.displayName}</div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <StatCard
                    label="Creator chance"
                    value={
                      room.creatorChancePercent !== null
                        ? `${room.creatorChancePercent}%`
                        : "Pending"
                    }
                  />
                  <StatCard
                    label="Opponent chance"
                    value={
                      room.opponentChancePercent !== null
                        ? `${room.opponentChancePercent}%`
                        : "Pending"
                    }
                  />
                </div>

                <div className="mt-4 rounded-[1.4rem] border border-white/10 bg-black/15 px-4 py-4 text-sm text-emerald-50/90">
                  All gifts from this room were transferred to the winner&apos;s inventory.
                </div>
              </div>
            )}

            {room.status === "cancelled" && (
              <div className="mt-5 rounded-[1.8rem] border border-amber-300/20 bg-amber-500/10 p-5 text-amber-100">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="h-6 w-6" />
                  <div>
                    <div className="text-2xl font-extrabold">Room cancelled</div>
                    <div className="mt-1 text-sm text-amber-100/80">
                      Locked gifts were returned to the creator&apos;s inventory.
                    </div>
                  </div>
                </div>
              </div>
            )}

            <section className="mt-6">
              <SectionTitle title="Creator Gifts" />
              <div className="mt-3 grid grid-cols-2 gap-3">
                {room.creatorItems.map((item) => (
                  <RoomGiftCard key={item.id} item={item} />
                ))}
              </div>
            </section>

            {room.opponentItems.length > 0 && (
              <section className="mt-6">
                <SectionTitle title="Opponent Gifts" />
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {room.opponentItems.map((item) => (
                    <RoomGiftCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}

            {room.status === "open" && isCreator && (
              <section className="mt-6">
                <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.06] p-5">
                  <div className="flex items-center gap-3">
                    <TimerReset className="h-5 w-5 text-cyan-200" />
                    <div>
                      <div className="text-lg font-extrabold">Waiting for an opponent</div>
                      <div className="mt-1 text-sm text-white/65">
                        You can still exit the room while nobody has locked the opposite side.
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      void handleCancelRoom();
                    }}
                    disabled={isPending}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-[1.5rem] bg-gradient-to-r from-rose-500 to-orange-500 px-5 py-4 text-lg font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isPending && <Loader2 className="h-5 w-5 animate-spin" />}
                    Exit room
                  </button>
                </div>
              </section>
            )}

            {room.status === "open" && !isCreator && (
              <section className="mt-6 pb-8">
                <SectionTitle title="Choose Your Gifts" />

                <div className="mt-3 rounded-[1.8rem] border border-white/10 bg-white/[0.06] p-5">
                  <div className="grid grid-cols-2 gap-3">
                    <StatCard label="Selected value" value={`${selectedTotalTon} TON`} />
                    <StatCard
                      label="Your chance"
                      value={selectedIds.length > 0 ? `${selectedChancePercent}%` : "Pick gifts"}
                    />
                  </div>

                  <div className="mt-4 rounded-[1.4rem] border border-white/10 bg-black/15 px-4 py-4 text-sm text-white/70">
                    To keep the fight fair, your total must stay between{" "}
                    <b>{room.joinRangeTon.min}</b> and <b>{room.joinRangeTon.max}</b> TON.
                  </div>
                </div>

                <div className="mt-4">
                  {inventory.length === 0 ? (
                    <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.06] px-5 py-8 text-center text-white/70">
                      Your inventory is empty. Open cases first to join CoinFlip rooms.
                    </div>
                  ) : (
                    <CoinflipGiftSelector
                      items={inventory}
                      selectedIds={selectedIds}
                      onToggle={toggleSelection}
                    />
                  )}
                </div>

                {!canConfirmJoin && selectedIds.length > 0 && (
                  <div className="mt-4 rounded-[1.4rem] border border-amber-300/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                    <div className="flex items-center gap-2">
                      <CircleAlert className="h-4 w-4" />
                      Your gift total must stay inside the allowed range before the room can start.
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    void handleJoinRoom();
                  }}
                  disabled={!canConfirmJoin || isPending}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-[1.5rem] bg-gradient-to-r from-violet-500 to-pink-500 px-5 py-4 text-lg font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending && <Loader2 className="h-5 w-5 animate-spin" />}
                  Confirm gifts
                </button>
              </section>
            )}

            {room.status === "finished" && (
              <div className="mt-6 pb-8">
                <button
                  type="button"
                  onClick={() => router.push("/games/coinflip")}
                  className="flex w-full items-center justify-center gap-2 rounded-[1.5rem] bg-gradient-to-r from-cyan-500 to-sky-500 px-5 py-4 text-lg font-extrabold text-white"
                >
                  <Sparkles className="h-5 w-5" />
                  Back to rooms
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <div className="text-xs uppercase tracking-[0.22em] text-white/45">{title}</div>;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.3rem] border border-white/10 bg-[#10182d] px-4 py-4">
      <div className="text-xs uppercase tracking-[0.18em] text-white/45">{label}</div>
      <div className="mt-2 text-base font-extrabold text-white">{value}</div>
    </div>
  );
}

function RoomGiftCard({ item }: { item: CoinflipRoomItem }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-3 text-white">
      <div
        className="flex h-24 items-center justify-center rounded-[1.2rem]"
        style={{ backgroundImage: item.reward.accent }}
      >
        <Image
          src={item.reward.image}
          alt={item.reward.name}
          width={76}
          height={76}
          className="h-16 w-16 object-contain"
        />
      </div>

      <div className="mt-3 text-base font-extrabold">{item.reward.name}</div>
      <div className="mt-1 text-xs text-white/55">{item.sourceCase.name}</div>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-white/55">Value</span>
        <span className="font-bold text-emerald-300">{item.reward.estimatedValueTon} TON</span>
      </div>
    </div>
  );
}
