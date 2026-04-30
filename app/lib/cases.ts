export type CaseReward = {
  id: string;
  dropId: string;
  telegramGiftTypeId?: string | null;
  name: string;
  image: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  chance: number;
  valueLabel: string;
  estimatedValueTon: number;
  accent: string;
  textColor: string;
};

export type CaseDefinition = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  shortDescription: string;
  priceTon: number;
  badgeGradient: string;
  buttonGradient: string;
  surfaceTint: string;
  image: string;
  rewards: CaseReward[];
};

export type CasePaymentStatus =
  | "pending"
  | "submitted"
  | "confirmed"
  | "expired"
  | "failed";

export type CasePaymentSource = "ton_wallet" | "internal_balance";

export type CasePaymentIntent = {
  id: string;
  caseId: string;
  caseSlug: string;
  caseName: string;
  paymentSource: CasePaymentSource;
  walletAddress: string;
  recipientAddress: string;
  amountTon: number;
  amountNano: string;
  reference: string;
  status: CasePaymentStatus;
  validUntil: string;
  confirmedAt: string | null;
  createdAt: string;
};

export type CaseOpeningResult = {
  paymentIntent: CasePaymentIntent;
  opening?: {
    id: string;
    userId: string | null;
    createdAt: string;
    caseId: string;
    caseDropId: string;
    giftTypeId: string;
  };
  case?: Pick<
    CaseDefinition,
    "id" | "slug" | "name" | "priceTon" | "image" | "badgeGradient" | "buttonGradient" | "surfaceTint"
  >;
  reward?: CaseReward;
  balanceTon?: number;
};

export type WalletBalanceSummary = {
  address: string;
  addressRaw: string;
  network: "mainnet" | "testnet";
  balanceNano: string;
  balanceTon: string;
};
