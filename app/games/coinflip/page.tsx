"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CircleX,
  Loader2,
  Plus,
  Sparkles,
  Sword,
} from "lucide-react";
import { useTelegramAuth } from "@/app/hooks/useTelegramAuth";
import {
  createCoinflipRoom,
  fetchCoinflipRoom,
  fetchOpenCoinflipRooms,
} from "@/app/lib/coinflip-api";
import type { CoinflipRoomDetail, CoinflipRoomSummary } from "@/app/lib/coinflip";
import { fetchUserProfile } from "@/app/lib/profile-api";
import type { ProfileInventoryItem, UserProfilePayload } from "@/app/lib/profile";
import CoinflipGiftSelector from "@/components/games/coinflip-gift-selector";
import CoinflipRoomCard from "@/components/games/coinflip-room-card";

export default function CoinflipLobbyPage() {
  const router = useRouter();
  const { user, loading, error } = useTelegramAuth();
  const userId = user?.id ?? null;

  const [rooms, setRooms] = useState<CoinflipRoomSummary[]>([]);
  const [profile, setProfile] = useState<UserProfilePayload | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCreateIds, setSelectedCreateIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewRoom, setPreviewRoom] = useState<CoinflipRoomDetail | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!userId) {
      setPageLoading(false);
      setPageError(user ? "User id is not available" : "CoinFlip lobby is unavailable");
      return;
    }

    let cancelled = false;

    const loadData = async () => {
      setPageLoading(true);

      try {
        const [roomsPayload, profilePayload] = await Promise.all([
          fetchOpenCoinflipRooms(),
          fetchUserProfile(userId),
        ]);

        if (!cancelled) {
          setRooms(roomsPayload);
          setProfile(profilePayload);
          setPageError(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setPageError(
            loadError instanceof Error ? loadError.message : "Failed to load CoinFlip lobby"
          );
        }
      } finally {
        if (!cancelled) {
          setPageLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [loading, user, userId]);

  const inventory = profile?.inventory ?? [];
  const myRooms = rooms.filter((room) => room.creator.id === userId);
  const publicRooms = rooms.filter((room) => room.creator.id !== userId);

  const selectedCreateItems = useMemo(
    () => inventory.filter((item) => selectedCreateIds.includes(item.id)),
    [inventory, selectedCreateIds]
  );
  const selectedCreateTotalTon = selectedCreateItems.reduce(
    (total, item) => total + item.reward.estimatedValueTon,
    0
  );

  const toggleCreateSelection = (openingId: string) => {
    setSelectedCreateIds((current) => {
      if (current.includes(openingId)) {
        return current.filter((id) => id !== openingId);
      }

      if (current.length >= 3) {
        return current;
      }

      return [...current, openingId];
    });
  };

  const openRoomPreview = async (roomId: string) => {
    setPreviewLoading(true);
    setPreviewRoom(null);

    try {
      const room = await fetchCoinflipRoom(roomId);
      setPreviewRoom(room);
      setPageError(null);
    } catch (previewError) {
      setPageError(
        previewError instanceof Error ? previewError.message : "Failed to load room preview"
      );
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    if (!userId || selectedCreateIds.length === 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const room = await createCoinflipRoom({
        userId,
        openingIds: selectedCreateIds,
      });

      setRooms((current) => [toSummary(room), ...current.filter((item) => item.id !== room.id)]);
      setSelectedCreateIds([]);
      setIsCreateModalOpen(false);
      setPageError(null);
      router.push(`/games/coinflip/${room.id}`);
    } catch (createError) {
      setPageError(
        createError instanceof Error ? createError.message : "Failed to create room"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#1f1843_0%,_#131d35_45%,_#0a1221_100%)] text-white">
      <div className="mx-auto w-full max-w-md px-5 py-6">
        <div className="mb-8 grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-white/10 pb-5">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex h-11 items-center gap-2 rounded-full bg-emerald-500/20 px-4 text-sm font-bold text-emerald-100"
          >
            <Plus className="h-4 w-4" />
            Create
          </button>

          <div className="text-center">
            <div className="text-[0.65rem] uppercase tracking-[0.28em] text-white/45">
              CoinFlip
            </div>
            <h1 className="text-2xl font-extrabold">Available Rooms</h1>
          </div>

          <Link
            href="/games"
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

        <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.08] px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500">
              <Sword className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-extrabold">Fight with up to 3 gifts</div>
              <div className="text-sm text-white/65">
                Create a room, wait for an opponent and let value decide the odds.
              </div>
            </div>
          </div>
        </div>

        {pageLoading ? (
          <div className="mt-6 space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-40 animate-pulse rounded-[1.8rem] bg-white/[0.08]"
              />
            ))}
          </div>
        ) : (
          <>
            {myRooms.length > 0 && (
              <section className="mt-6">
                <div className="mb-3 text-xs uppercase tracking-[0.22em] text-white/45">
                  Your Open Room
                </div>
                <div className="space-y-4">
                  {myRooms.map((room) => (
                    <CoinflipRoomCard
                      key={room.id}
                      room={room}
                      ownedByCurrentUser
                      onOpen={() => router.push(`/games/coinflip/${room.id}`)}
                    />
                  ))}
                </div>
              </section>
            )}

            <section className="mt-6 pb-8">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-xs uppercase tracking-[0.22em] text-white/45">
                  Joinable Rooms
                </div>
                <div className="text-sm text-white/55">{publicRooms.length} rooms</div>
              </div>

              {publicRooms.length === 0 ? (
                <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.08] px-5 py-8 text-center text-white/70">
                  No open rooms yet. Create the first CoinFlip and invite the lobby to fight.
                </div>
              ) : (
                <div className="space-y-4">
                  {publicRooms.map((room) => (
                    <CoinflipRoomCard
                      key={room.id}
                      room={room}
                      ownedByCurrentUser={false}
                      onOpen={() => {
                        void openRoomPreview(room.id);
                      }}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-40 flex items-end bg-[#050914]/70 px-4 pb-4 pt-10 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-md rounded-[2rem] border border-white/10 bg-[#111b31] p-5 text-white shadow-[0_24px_60px_rgba(0,0,0,0.36)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-emerald-200/75">
                  Create room
                </div>
                <h2 className="mt-2 text-2xl font-extrabold">Choose up to 3 gifts</h2>
                <p className="mt-2 text-sm text-white/65">
                  Selected gifts are locked until someone joins or you cancel the room.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!isSubmitting) {
                    setIsCreateModalOpen(false);
                    setSelectedCreateIds([]);
                  }
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10"
              >
                <CircleX className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-4 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/55">Selected gifts</span>
                <span className="font-bold text-white">{selectedCreateIds.length}/3</span>
              </div>
              <div className="mt-2 text-2xl font-extrabold text-emerald-300">
                {selectedCreateTotalTon} TON
              </div>
            </div>

            <div className="mt-5 max-h-[50vh] overflow-y-auto pr-1">
              {inventory.length === 0 ? (
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] px-5 py-8 text-center text-white/70">
                  Your inventory is empty. Open cases first to collect gifts for CoinFlip.
                </div>
              ) : (
                <CoinflipGiftSelector
                  items={inventory}
                  selectedIds={selectedCreateIds}
                  onToggle={toggleCreateSelection}
                />
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                void handleCreateRoom();
              }}
              disabled={selectedCreateIds.length === 0 || isSubmitting}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-[1.5rem] bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-4 text-lg font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}
              Confirm gifts
            </button>
          </div>
        </div>
      )}

      {(previewLoading || previewRoom) && (
        <div className="fixed inset-0 z-40 flex items-end bg-[#050914]/70 px-4 pb-4 pt-10 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-md rounded-[2rem] border border-white/10 bg-[#10182d] p-5 text-white shadow-[0_24px_60px_rgba(0,0,0,0.36)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-cyan-200/75">
                  Room preview
                </div>
                <h2 className="mt-2 text-2xl font-extrabold">
                  {previewRoom?.roomCode ?? "Loading room"}
                </h2>
                <p className="mt-2 text-sm text-white/65">
                  See the creator&apos;s gifts before you join the fight.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!previewLoading) {
                    setPreviewRoom(null);
                  }
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10"
              >
                <CircleX className="h-5 w-5" />
              </button>
            </div>

            {previewLoading || !previewRoom ? (
              <div className="mt-8 flex items-center justify-center py-10 text-white/70">
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                Loading room...
              </div>
            ) : (
              <>
                <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/[0.05] px-4 py-4">
                  <div className="text-sm text-white/55">Creator</div>
                  <div className="mt-1 text-2xl font-extrabold">
                    {previewRoom.creator.displayName}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-white/55">Room value</span>
                    <span className="font-bold text-cyan-200">
                      {previewRoom.creatorTotalTon} TON
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-sm">
                    <span className="text-white/55">Valid join range</span>
                    <span className="font-bold text-white">
                      {previewRoom.joinRangeTon.min}-{previewRoom.joinRangeTon.max} TON
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  {previewRoom.creatorItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-[1.4rem] border border-white/10 bg-white/[0.06] p-3"
                    >
                      <div
                        className="flex h-24 items-center justify-center rounded-[1.2rem]"
                        style={{ backgroundImage: item.reward.accent }}
                      >
                        <Image
                          src={item.reward.image}
                          alt={item.reward.name}
                          width={72}
                          height={72}
                          className="h-16 w-16 object-contain"
                        />
                      </div>
                      <div className="mt-3 text-sm font-extrabold">{item.reward.name}</div>
                      <div className="mt-1 text-xs text-white/55">
                        {item.reward.estimatedValueTon} TON
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => router.push(`/games/coinflip/${previewRoom.id}`)}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-[1.5rem] bg-gradient-to-r from-violet-500 to-pink-500 px-5 py-4 text-lg font-extrabold text-white"
                >
                  <Sparkles className="h-5 w-5" />
                  {previewRoom.creator.id === userId ? "Go to room" : "Join room"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

function toSummary(room: CoinflipRoomDetail): CoinflipRoomSummary {
  return {
    id: room.id,
    roomCode: room.roomCode,
    status: room.status,
    createdAt: room.createdAt,
    creatorTotalTon: room.creatorTotalTon,
    creatorGiftCount: room.creatorItems.length,
    creator: room.creator,
    previewItems: room.creatorItems.slice(0, 3),
  };
}
