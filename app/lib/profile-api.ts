import { buildApiUrl } from "@/app/lib/api";
import type { ProfileInventoryItem, UserProfilePayload } from "@/app/lib/profile";

export async function fetchUserProfile(userId: string) {
  const response = await fetch(buildApiUrl(`/users/${userId}/profile`), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await buildApiErrorMessage(response, "Failed to load profile"));
  }

  return (await response.json()) as UserProfilePayload;
}

export async function fetchInventoryItem(userId: string, openingId: string) {
  const response = await fetch(buildApiUrl(`/users/${userId}/inventory/${openingId}`), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await buildApiErrorMessage(response, "Failed to load inventory item"));
  }

  return (await response.json()) as ProfileInventoryItem;
}

export async function sellInventoryItem(userId: string, openingId: string) {
  const response = await fetch(
    buildApiUrl(`/users/${userId}/inventory/${openingId}/sell`),
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error(await buildApiErrorMessage(response, "Failed to sell inventory item"));
  }

  return (await response.json()) as ProfileInventoryItem;
}

export async function withdrawInventoryItem(userId: string, openingId: string) {
  const response = await fetch(
    buildApiUrl(`/users/${userId}/inventory/${openingId}/withdraw`),
    {
      method: "POST",
    }
  );

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
