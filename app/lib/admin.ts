export type AdminStatusPayload = {
  isAdmin: true;
  user: {
    id: string;
    telegramId: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    photoUrl: string | null;
  };
};

export type AdminOverviewPayload = {
  stats: {
    totalUsers: number;
    totalInternalBalanceTon: number;
    pendingWithdrawals: number;
    openCoinflipRooms: number;
  };
  purchaseQueue: Array<{
    status: string;
    count: number;
  }>;
  providers: Array<{
    key: string;
    label: string;
  }>;
  recentAuditLogs: Array<{
    id: string;
    action: string;
    entityType: string;
    entityId: string | null;
    userId: string | null;
    createdAt: string;
  }>;
};

export type AdminUser = {
  id: string;
  telegramId: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  balanceTon: number;
  tonWalletAddress: string | null;
  createdAt: string;
  inventoryCount: number;
};

export type AdminBalanceTransaction = {
  id: string;
  type: string;
  amountTon: number;
  balanceAfterTon: number;
  referenceType: string | null;
  referenceId: string | null;
  note: string | null;
  createdAt: string;
  user: {
    id: string;
    telegramId: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
  };
};

export type AdminWithdrawal = {
  id: string;
  withdrawalRequestedAt: string | null;
  user: {
    id: string;
    telegramId: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
  } | null;
  case: {
    id: string;
    slug: string;
    name: string;
  };
  giftType: {
    id: string;
    name: string;
    image: string;
    estimatedValueTon: number;
  };
  purchaseRequestId: string | null;
  purchaseStatus: string | null;
};

export type AdminPurchaseRequest = {
  id: string;
  status: string;
  providerKey: string | null;
  providerLabel: string | null;
  searchQuery: string;
  externalListingId: string | null;
  externalListingUrl: string | null;
  externalOrderId: string | null;
  quotedPriceTon: number | null;
  purchasedPriceTon: number | null;
  deliveryTelegramGiftId: string | null;
  failureReason: string | null;
  adminNote: string | null;
  queuedAt: string;
  searchStartedAt: string | null;
  offerFoundAt: string | null;
  purchasedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  metadata: unknown;
  user: {
    id: string;
    telegramId: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
  };
  opening: {
    id: string;
    status: string;
    createdAt: string;
    case: {
      id: string;
      slug: string;
      name: string;
    };
  };
  giftType: {
    id: string;
    telegramGiftTypeId: string | null;
    name: string;
    image: string;
    rarity: string;
    estimatedValueTon: number;
  };
};
