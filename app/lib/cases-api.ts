import { buildApiUrl } from "@/app/lib/api";
import type {
  CaseDefinition,
  CaseOpeningResult,
  CasePaymentIntent,
  WalletBalanceSummary,
} from "@/app/lib/cases";

type CreatePaymentIntentResponse = {
  paymentIntent: CasePaymentIntent;
  transaction: {
    validUntil: number;
    messages: Array<{
      address: string;
      amount: string;
      payload?: string;
    }>;
  };
};

type SubmitPaymentIntentResponse = {
  paymentIntent: CasePaymentIntent;
};

export async function fetchCasesCatalog() {
  const response = await fetch(buildApiUrl("/cases"));

  if (!response.ok) {
    throw new Error(await buildApiErrorMessage(response, "Failed to load cases"));
  }

  return (await response.json()) as CaseDefinition[];
}

export async function fetchCaseBySlug(slug: string) {
  const response = await fetch(buildApiUrl(`/cases/${slug}`));

  if (!response.ok) {
    throw new Error(await buildApiErrorMessage(response, "Failed to load case"));
  }

  return (await response.json()) as CaseDefinition;
}

export async function createCasePaymentIntent(input: {
  slug: string;
  walletAddress: string;
  userId?: string;
}) {
  const response = await fetch(buildApiUrl(`/cases/${input.slug}/payment-intents`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      walletAddress: input.walletAddress,
      userId: input.userId,
    }),
  });

  if (!response.ok) {
    throw new Error(
      await buildApiErrorMessage(response, "Failed to create case payment intent")
    );
  }

  return (await response.json()) as CreatePaymentIntentResponse;
}

export async function submitCasePaymentIntent(intentId: string, boc?: string) {
  const response = await fetch(buildApiUrl(`/cases/payment-intents/${intentId}/submit`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(boc ? { boc } : {}),
  });

  if (!response.ok) {
    throw new Error(
      await buildApiErrorMessage(response, "Failed to submit TON payment")
    );
  }

  return (await response.json()) as SubmitPaymentIntentResponse;
}

export async function fetchCasePaymentIntentStatus(intentId: string) {
  const response = await fetch(buildApiUrl(`/cases/payment-intents/${intentId}`), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      await buildApiErrorMessage(response, "Failed to check TON payment status")
    );
  }

  return (await response.json()) as CaseOpeningResult;
}

export async function fetchWalletBalance(address: string) {
  const response = await fetch(
    buildApiUrl(`/cases/wallet-balance?address=${encodeURIComponent(address)}`),
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(await buildApiErrorMessage(response, "Failed to load wallet balance"));
  }

  return (await response.json()) as WalletBalanceSummary;
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
    // Ignore JSON parsing errors and use the HTTP status fallback below.
  }

  return `${fallback} (${response.status})`;
}
