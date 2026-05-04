import { apiFetch } from "@/app/lib/api";
import type {
  ProfileInventoryItem,
  UserBalancePayload,
  UserProfilePayload,
} from "@/app/lib/profile";

export async function fetchUserProfile() {
  const response = await apiFetch(`/users/me/profile`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await buildApiErrorMessage(response, "Failed to load profile"));
  }

  return (await response.json()) as UserProfilePayload;
}

export async function fetchInventoryItem(openingId: string) {
  const response = await apiFetch(`/users/me/inventory/${openingId}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await buildApiErrorMessage(response, "Failed to load inventory item"));
  }

  return (await response.json()) as ProfileInventoryItem;
}

export async function fetchUserBalance() {
  const response = await apiFetch(`/users/me/balance`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await buildApiErrorMessage(response, "Failed to load balance"));
  }

  return (await response.json()) as UserBalancePayload;
}

export async function sellInventoryItem(openingId: string) {
  const response = await apiFetch(`/users/me/inventory/${openingId}/sell`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(await buildApiErrorMessage(response, "Failed to sell inventory item"));
  }

  return (await response.json()) as ProfileInventoryItem;
}

export async function withdrawInventoryItem(openingId: string) {
  const response = await apiFetch(`/users/me/inventory/${openingId}/withdraw`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(
      await buildApiErrorMessage(response, "Failed to request gift withdrawal")
    );
  }

  return (await response.json()) as ProfileInventoryItem;
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
    // Ignore JSON parsing errors and use the fallback below.
  }

  return `${fallback} (${response.status})`;
}
