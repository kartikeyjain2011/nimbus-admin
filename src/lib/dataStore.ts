export interface UserRecord {
  id: string;
  clerkId: string;
  name: string;
  email: string;
  imageUrl?: string;
  tier: "Basic" | "Priority" | "Ultra" | "Ultimate";
  joined: string;
  totalHours: string;
  status: "Active Now" | "Idle" | "Offline";
  currentGame?: string;
  device?: string;
  gamesPurchased: string[];
  lastActive: string;
  metadata?: Record<string, unknown>;
}

export interface SubscriptionPlan {
  id: string;
  name: "BASIC" | "PRO" | "PREMIUM" | "ULTIMATE";
  price: string;
  mrr: string;
  subscribers: number;
  hardware: string;
  growth: string;
  badge?: string;
}

export interface RazorpayTransaction {
  txId: string;
  user: string;
  email: string;
  clerkId: string;
  plan: string;
  amount: string;
  method: string;
  date: string;
  status: "Success" | "Pending" | "Failed";
}

export interface GameItem {
  id: number;
  title: string;
  publisher: string;
  genre: string;
  activePlayers: number;
  precached: boolean;
  minTier: "Basic" | "Priority" | "Ultra" | "Ultimate";
  rayTracing: string;
  storageGB: number;
  rating: string;
  purchasesCount: number;
  bgImage?: string;
}

// Real-time Data Store (populated dynamically from Clerk API & frontendnimbuz.vercel.app)
let usersStore: UserRecord[] = [];
const plansStore: SubscriptionPlan[] = [
  { id: "p1", name: "BASIC", price: "₹799", mrr: "₹8,45,000", subscribers: 1058, hardware: "RTX 3060 / 8GB VRAM", growth: "+12%" },
  { id: "p2", name: "PRO", price: "₹1,499", mrr: "₹16,80,000", subscribers: 1120, hardware: "RTX 4070 Ti / 16GB VRAM", growth: "+18%", badge: "Most Popular" },
  { id: "p3", name: "PREMIUM", price: "₹2,499", mrr: "₹12,50,000", subscribers: 500, hardware: "RTX 4090 / 24GB VRAM", growth: "+25%", badge: "Best Value" },
  { id: "p4", name: "ULTIMATE", price: "₹2,999", mrr: "₹5,10,000", subscribers: 170, hardware: "RTX 4090 Ti Bare-Metal", growth: "+31%", badge: "Ultimate" }
];
let transactionsStore: RazorpayTransaction[] = [];
let gamesStore: GameItem[] = [];

export const getStoreUsers = () => usersStore;

export const setStoreUsers = (users: UserRecord[]) => {
  usersStore = users;
};

export const updateUserTier = (userId: string, newTier: UserRecord["tier"]) => {
  const user = usersStore.find(u => u.id === userId || u.clerkId === userId);
  if (user) {
    user.tier = newTier;
  }
  return user;
};

export const addUserGamePurchase = (userId: string, gameTitle: string) => {
  const user = usersStore.find(u => u.id === userId || u.clerkId === userId);
  if (user) {
    if (!user.gamesPurchased) user.gamesPurchased = [];
    if (!user.gamesPurchased.includes(gameTitle)) {
      user.gamesPurchased.push(gameTitle);
    }
  }
  const game = gamesStore.find(g => g.title === gameTitle);
  if (game) {
    game.purchasesCount = (game.purchasesCount || 0) + 1;
  }
  return user;
};

export const getStorePlans = () => plansStore;
export const getStoreTransactions = () => transactionsStore;
export const setStoreTransactions = (txs: RazorpayTransaction[]) => {
  transactionsStore = txs;
};

export const addRazorpayTransaction = (tx: RazorpayTransaction) => {
  transactionsStore.unshift(tx);
  return tx;
};

export const getStoreGames = () => gamesStore;
export const setStoreGames = (games: GameItem[]) => {
  gamesStore = games;
};

interface ClerkUserShape {
  id?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  emailAddresses?: Array<{ emailAddress?: string | null }> | null;
  emailAddress?: string | null;
  email?: string | null;
  imageUrl?: string | null;
  profileImageUrl?: string | null;
  createdAt?: number | string | null;
  lastSignInAt?: number | string | null;
  publicMetadata?: (Record<string, unknown> & { tier?: UserRecord["tier"]; totalHours?: string; currentGame?: string; device?: string; gamesPurchased?: string[] }) | null;
  unsafeMetadata?: (Record<string, unknown> & { tier?: UserRecord["tier"] }) | null;
}

// Merge live Clerk User object array into store
export const mergeClerkUsers = (clerkUsers: ClerkUserShape[]): UserRecord[] => {
  clerkUsers.forEach((cu) => {
    const primaryEmail = cu.emailAddresses?.[0]?.emailAddress || cu.emailAddress || cu.email || "user@nimbus.dev";
    const name = cu.firstName ? `${cu.firstName} ${cu.lastName || ""}`.trim() : cu.username || primaryEmail.split("@")[0];
    const existingIndex = usersStore.findIndex(u => u.clerkId === cu.id || u.email === primaryEmail);

    const createdAtDate = cu.createdAt ? new Date(cu.createdAt).toLocaleDateString() : "Recently";
    const lastActiveDate = cu.lastSignInAt ? new Date(cu.lastSignInAt).toLocaleTimeString() : "Active Now";

    const userId = cu.id ? `USR-${cu.id.substring(5, 12)}` : `USR-${Math.random().toString(36).substr(2, 7)}`;

    const userObj: UserRecord = {
      id: userId,
      clerkId: cu.id || "",
      name: name || "Clerk Gamer",
      email: primaryEmail,
      imageUrl: (cu.imageUrl || cu.profileImageUrl) ?? undefined,
      tier: (cu.publicMetadata?.tier as UserRecord["tier"]) || (cu.unsafeMetadata?.tier as UserRecord["tier"]) || "Priority",
      joined: createdAtDate,
      totalHours: (cu.publicMetadata?.totalHours as string) || "120 hrs",
      status: cu.lastSignInAt ? "Active Now" : "Idle",
      currentGame: (cu.publicMetadata?.currentGame as string) || "Cyberpunk 2077: Phantom Liberty",
      device: (cu.publicMetadata?.device as string) || "Desktop / TV",
      gamesPurchased: (cu.publicMetadata?.gamesPurchased as string[]) || ["Black Myth: Wukong", "Cyberpunk 2077: Phantom Liberty"],
      lastActive: lastActiveDate,
      metadata: cu.publicMetadata ?? undefined
    };

    if (existingIndex >= 0) {
      usersStore[existingIndex] = { ...usersStore[existingIndex], ...userObj };
    } else {
      usersStore.push(userObj);
    }
  });

  return usersStore;
};
