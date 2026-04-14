export type InventoryItemStatus =
  | "owned"
  | "sold"
  | "withdraw_pending"
  | "withdrawn";

export type ProfileInventoryItem = {
  id: string;
  status: InventoryItemStatus;
  soldAmountTon: number | null;
  soldAt: string | null;
  withdrawalRequestedAt: string | null;
  withdrawnAt: string | null;
  createdAt: string;
  case: {
    id: string;
    slug: string;
    name: string;
    priceTon: number;
    image: string;
    badgeGradient: string;
  };
  reward: {
    id: string;
    telegramGiftTypeId: string | null;
    name: string;
    image: string;
    estimatedValueTon: number;
    rarity: "common" | "rare" | "epic" | "legendary";
    valueLabel: string;
    accent: string;
    textColor: string;
  };
};

export type ProfileHistoryEntry = {
  id: string;
  status: InventoryItemStatus;
  createdAt: string;
  soldAmountTon: number | null;
  case: {
    slug: string;
    name: string;
    image: string;
  };
  reward: {
    id: string;
    name: string;
    image: string;
    estimatedValueTon: number;
    rarity: "common" | "rare" | "epic" | "legendary";
  };
};

export type UserProfilePayload = {
  user: {
    id: string;
    telegramId: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    photoUrl: string | null;
    tonWalletAddress: string | null;
    tonWalletNetwork: "MAINNET" | "TESTNET" | null;
    tonWalletConnectedAt: string | null;
  };
  summary: {
    totalWonTon: number;
    totalItemsWon: number;
    activeInventoryCount: number;
    totalSoldTon: number;
    mostExpensiveGift: ProfileInventoryItem | null;
  };
  inventory: ProfileInventoryItem[];
  openingHistory: ProfileHistoryEntry[];
};
