import { apiFetch } from "@/app/lib/api";
import type { CoinflipRoomDetail, CoinflipRoomSummary } from "@/app/lib/coinflip";

export async function fetchOpenCoinflipRooms() {
  const response = await apiFetch("/coinflip/rooms", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await buildApiErrorMessage(response, "Failed to load CoinFlip rooms"));
  }

  return (await response.json()) as CoinflipRoomSummary[];
}

export async function fetchCoinflipRoom(roomId: string) {
  const response = await apiFetch(`/coinflip/rooms/${roomId}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await buildApiErrorMessage(response, "Failed to load CoinFlip room"));
  }

  return (await response.json()) as CoinflipRoomDetail;
}

export async function createCoinflipRoom(input: { openingIds: string[] }) {
  const response = await apiFetch("/coinflip/rooms", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await buildApiErrorMessage(response, "Failed to create CoinFlip room"));
  }

  return (await response.json()) as CoinflipRoomDetail;
}

export async function cancelCoinflipRoom(roomId: string) {
  const response = await apiFetch(`/coinflip/rooms/${roomId}/cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    throw new Error(await buildApiErrorMessage(response, "Failed to cancel CoinFlip room"));
  }

  return (await response.json()) as CoinflipRoomDetail;
}

export async function joinCoinflipRoom(input: {
  roomId: string;
  openingIds: string[];
}) {
  const response = await apiFetch(`/coinflip/rooms/${input.roomId}/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      openingIds: input.openingIds,
    }),
  });

  if (!response.ok) {
    throw new Error(await buildApiErrorMessage(response, "Failed to join CoinFlip room"));
  }

  return (await response.json()) as CoinflipRoomDetail;
}

async function buildApiErrorMessage(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as {
      message?: string | string[];
      error?: string;
    };

    const message = Array.isArray(payload.message)
      ? payload.message.join(", ")
      : payload.message;

    if (message) {
      return `${fallback}: ${message}`;
    }

    if (payload.error) {
      return `${fallback}: ${payload.error}`;
    }
  } catch {
    // Ignore malformed JSON and use the fallback below.
  }

  return `${fallback} (${response.status})`;
}
