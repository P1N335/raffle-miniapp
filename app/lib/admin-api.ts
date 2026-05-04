import { apiFetch } from "@/app/lib/api";
import type {
  AdminBalanceTransaction,
  AdminOverviewPayload,
  AdminPurchaseRequest,
  AdminStatusPayload,
  AdminUser,
  AdminWithdrawal,
} from "@/app/lib/admin";

export async function fetchAdminStatus() {
  const response = await apiFetch("/admin/me", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await buildApiErrorMessage(response, "Failed to check admin access"));
  }

  return (await response.json()) as AdminStatusPayload;
}

export async function fetchAdminOverview() {
  const response = await apiFetch("/admin/overview", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await buildApiErrorMessage(response, "Failed to load admin overview"));
  }

  return (await response.json()) as AdminOverviewPayload;
}

export async function fetchAdminUsers(limit = 25) {
  const response = await apiFetch(`/admin/users?limit=${limit}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await buildApiErrorMessage(response, "Failed to load users"));
  }

  return (await response.json()) as AdminUser[];
}

export async function fetchAdminBalanceTransactions(limit = 50) {
  const response = await apiFetch(`/admin/balance-transactions?limit=${limit}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      await buildApiErrorMessage(response, "Failed to load balance transactions")
    );
  }

  return (await response.json()) as AdminBalanceTransaction[];
}

export async function fetchAdminWithdrawals(limit = 50) {
  const response = await apiFetch(`/admin/withdrawals?limit=${limit}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await buildApiErrorMessage(response, "Failed to load withdrawals"));
  }

  return (await response.json()) as AdminWithdrawal[];
}

export async function fetchAdminPurchaseRequests(status = "all", limit = 50) {
  const response = await apiFetch(
    `/admin/purchase-requests?status=${encodeURIComponent(status)}&limit=${limit}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(await buildApiErrorMessage(response, "Failed to load purchase queue"));
  }

  return (await response.json()) as AdminPurchaseRequest[];
}

export async function adjustAdminUserBalance(
  userId: string,
  amountTon: number,
  note?: string
) {
  const response = await apiFetch(`/admin/users/${userId}/balance-adjustments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amountTon,
      note,
    }),
  });

  if (!response.ok) {
    throw new Error(await buildApiErrorMessage(response, "Failed to adjust balance"));
  }

  return (await response.json()) as {
    userId: string;
    balanceTon: number;
  };
}

export async function searchAdminPurchaseRequest(requestId: string) {
  const response = await apiFetch(`/admin/purchase-requests/${requestId}/search`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(await buildApiErrorMessage(response, "Failed to search marketplaces"));
  }

  return (await response.json()) as AdminPurchaseRequest;
}

export async function markAdminPurchaseFound(input: {
  requestId: string;
  providerKey: string;
  providerLabel: string;
  externalListingId?: string;
  externalListingUrl?: string;
  quotedPriceTon?: number;
  adminNote?: string;
}) {
  const response = await apiFetch(`/admin/purchase-requests/${input.requestId}/mark-found`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await buildApiErrorMessage(response, "Failed to mark offer found"));
  }

  return (await response.json()) as AdminPurchaseRequest;
}

export async function markAdminPurchasePurchased(input: {
  requestId: string;
  externalOrderId?: string;
  purchasedPriceTon?: number;
  adminNote?: string;
}) {
  const response = await apiFetch(
    `/admin/purchase-requests/${input.requestId}/mark-purchased`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    }
  );

  if (!response.ok) {
    throw new Error(await buildApiErrorMessage(response, "Failed to mark request purchased"));
  }

  return (await response.json()) as AdminPurchaseRequest;
}

export async function markAdminPurchaseDelivered(input: {
  requestId: string;
  deliveryTelegramGiftId?: string;
  adminNote?: string;
}) {
  const response = await apiFetch(
    `/admin/purchase-requests/${input.requestId}/mark-delivered`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    }
  );

  if (!response.ok) {
    throw new Error(await buildApiErrorMessage(response, "Failed to mark request delivered"));
  }

  return (await response.json()) as AdminPurchaseRequest;
}

export async function markAdminPurchaseFailed(input: {
  requestId: string;
  reason: string;
  adminNote?: string;
}) {
  const response = await apiFetch(`/admin/purchase-requests/${input.requestId}/fail`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await buildApiErrorMessage(response, "Failed to mark request failed"));
  }

  return (await response.json()) as AdminPurchaseRequest;
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
    // Ignore malformed JSON and keep the fallback.
  }

  return `${fallback} (${response.status})`;
}
