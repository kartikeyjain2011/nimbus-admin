import { NextResponse } from "next/server";
import { getStoreUsers, getStoreTransactions, getStoreGames } from "@/lib/dataStore";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("q") || "").trim().toLowerCase();

    if (!query) {
      return NextResponse.json({
        success: true,
        query: "",
        results: { users: [], transactions: [], games: [], nodes: [], sessions: [] },
        totalCount: 0
      });
    }

    // 1. Search Users / Streamers
    const users = getStoreUsers();
    const matchedUsers = users.filter((u) => {
      return (
        u.id.toLowerCase().includes(query) ||
        u.clerkId.toLowerCase().includes(query) ||
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.tier.toLowerCase().includes(query) ||
        (u.currentGame && u.currentGame.toLowerCase().includes(query)) ||
        (u.subscriptionStatus && u.subscriptionStatus.toLowerCase().includes(query))
      );
    });

    // 2. Search Transactions
    let transactions = getStoreTransactions();
    if (transactions.length === 0) {
      // Derive default transactions if empty
      transactions = users.map((u, i) => ({
        txId: `pay_Razorpay_${9401 + i}`,
        user: u.name,
        email: u.email,
        clerkId: u.clerkId,
        plan: u.tier === "Ultimate" ? "ULTIMATE" : u.tier === "Ultra" ? "PREMIUM" : u.tier === "Priority" ? "PRO" : "BASIC",
        amount: u.tier === "Ultimate" ? "₹2,999" : u.tier === "Ultra" ? "₹2,499" : u.tier === "Priority" ? "₹1,499" : "₹799",
        method: i % 2 === 0 ? "UPI (Razorpay Live)" : "Credit Card (HDFC)",
        date: new Date(Date.now() - i * 3600000).toISOString().replace("T", " ").substring(0, 16),
        status: "Success" as const,
        subscriptionStatus: "Active" as const
      }));
    }

    const matchedTransactions = transactions.filter((tx) => {
      return (
        tx.txId.toLowerCase().includes(query) ||
        tx.user.toLowerCase().includes(query) ||
        tx.email.toLowerCase().includes(query) ||
        tx.clerkId.toLowerCase().includes(query) ||
        tx.plan.toLowerCase().includes(query) ||
        tx.amount.toLowerCase().includes(query) ||
        tx.method.toLowerCase().includes(query) ||
        (tx.subscriptionStatus && tx.subscriptionStatus.toLowerCase().includes(query)) ||
        (tx.status && tx.status.toLowerCase().includes(query))
      );
    });

    // 3. Search Games
    const games = getStoreGames();
    const matchedGames = games.filter((g) => {
      return (
        g.title.toLowerCase().includes(query) ||
        g.publisher.toLowerCase().includes(query) ||
        g.genre.toLowerCase().includes(query) ||
        g.minTier.toLowerCase().includes(query) ||
        String(g.id).includes(query)
      );
    });

    // 4. Search GPU Nodes / Infrastructure Racks
    const nodeRacks = [
      { id: "RACK-MUM-01", dc: "Mumbai Primary DC", type: "NVIDIA RTX 4090 (24GB VRAM)", load: 96, status: "Online" },
      { id: "RACK-MUM-02", dc: "Mumbai Primary DC", type: "NVIDIA RTX 4070 Ti (16GB VRAM)", load: 88, status: "Online" },
      { id: "RACK-DEL-01", dc: "Delhi North DC", type: "NVIDIA RTX 4090 Ti Bare-Metal", load: 98, status: "Online" },
      { id: "RACK-BLR-01", dc: "Bangalore Edge DC", type: "NVIDIA RTX 3060 (8GB VRAM)", load: 72, status: "Online" },
      { id: "RACK-SIN-01", dc: "Singapore Hub DC", type: "NVIDIA RTX 4080 (16GB VRAM)", load: 60, status: "Standby" }
    ];

    const matchedNodes = nodeRacks.filter((n) => {
      return (
        n.id.toLowerCase().includes(query) ||
        n.dc.toLowerCase().includes(query) ||
        n.type.toLowerCase().includes(query) ||
        n.status.toLowerCase().includes(query)
      );
    });

    // 5. Search Active Player Sessions
    const activeSessions = [
      { id: "S-9482", user: "R. Sen", email: "rsen.gamer@gmail.com", game: "Cyberpunk 2077: Phantom Liberty", tier: "Priority", device: "Laptop", gpu: "RTX 4070 Ti" },
      { id: "S-9483", user: "A. Fernandes", email: "a.ferns@yahoo.co.in", game: "Black Myth: Wukong", tier: "Priority", device: "TV", gpu: "RTX 4070 Ti" },
      { id: "S-9484", user: "K. Iyer", email: "kiyer99@outlook.com", game: "Elden Ring: Shadow of Erdtree", tier: "Ultra", device: "Laptop", gpu: "RTX 4090" },
      { id: "S-9485", user: "V. Sharma", email: "vsharma.dev@gmail.com", game: "Forza Horizon 5", tier: "Ultimate", device: "TV", gpu: "RTX 4090 Ti Bare-Metal" },
      { id: "S-9486", user: "P. Patel", email: "patel.pranav@gmail.com", game: "Grand Theft Auto V", tier: "Basic", device: "Phone", gpu: "RTX 3060" },
      { id: "S-9487", user: "S. Rao", email: "srao_gaming@gmail.com", game: "Red Dead Redemption 2", tier: "Ultra", device: "Tablet", gpu: "RTX 4090" }
    ];

    const matchedSessions = activeSessions.filter((s) => {
      return (
        s.id.toLowerCase().includes(query) ||
        s.user.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query) ||
        s.game.toLowerCase().includes(query) ||
        s.tier.toLowerCase().includes(query) ||
        s.device.toLowerCase().includes(query) ||
        s.gpu.toLowerCase().includes(query)
      );
    });

    const totalCount =
      matchedUsers.length +
      matchedTransactions.length +
      matchedGames.length +
      matchedNodes.length +
      matchedSessions.length;

    return NextResponse.json({
      success: true,
      query,
      results: {
        users: matchedUsers,
        transactions: matchedTransactions,
        games: matchedGames,
        nodes: matchedNodes,
        sessions: matchedSessions
      },
      totalCount
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
