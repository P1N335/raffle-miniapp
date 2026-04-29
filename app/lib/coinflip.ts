export type CoinflipRoomStatus = "open" | "finished" | "cancelled";
export type CoinflipSeat = "creator" | "opponent";

export type CoinflipReward = {
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

export type CoinflipRoomItem = {
  id: string;
  seat: CoinflipSeat;
  ownerUserId: string;
  ownerName: string;
  openingId: string;
  estimatedValueTon: number;
  sourceCase: {
    id: string;
    slug: string;
    name: string;
  };
  reward: CoinflipReward;
};

export type CoinflipPlayer = {
  id: string;
  telegramId: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  photoUrl: string | null;
  displayName: string;
};

export type CoinflipRoomSummary = {
  id: string;
  roomCode: string;
  status: CoinflipRoomStatus;
  createdAt: string;
  creatorTotalTon: number;
  creatorGiftCount: number;
  creator: CoinflipPlayer;
  previewItems: CoinflipRoomItem[];
};

export type CoinflipRoomDetail = {
  id: string;
  roomCode: string;
  status: CoinflipRoomStatus;
  createdAt: string;
  creatorReadyAt: string;
  opponentReadyAt: string | null;
  finishedAt: string | null;
  cancelledAt: string | null;
  creatorTotalTon: number;
  opponentTotalTon: number | null;
  totalPotTon: number;
  joinRangeTon: {
    min: number;
    max: number;
  };
  creatorChancePercent: number | null;
  opponentChancePercent: number | null;
  creator: CoinflipPlayer;
  opponent: CoinflipPlayer | null;
  winner: CoinflipPlayer | null;
  creatorItems: CoinflipRoomItem[];
  opponentItems: CoinflipRoomItem[];
};
