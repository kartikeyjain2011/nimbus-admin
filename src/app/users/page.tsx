"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, RefreshCw, CheckCircle2, ChevronRight, Gamepad2, X, Users } from "lucide-react";

interface UserRecord {
  id: string;
  clerkId: string;
  name: string;
  email: string;
  imageUrl?: string;
  tier: "Basic" | "Priority" | "Ultra" | "Ultimate";
  subscriptionStatus?: "Active" | "Cancelled";
  joined: string;
  totalHours: string;
  status: "Active Now" | "Idle" | "Offline";
  currentGame?: string;
  device?: string;
  gamesPurchased: string[];
  lastActive: string;
}

function UsersPageContent() {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || "";
  const [userSearch, setUserSearch] = useState<string | null>(null);
  const search = userSearch ?? urlSearch;

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [subFilter, setSubFilter] = useState<"All" | "Active" | "Cancelled">("All");
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.success && data.users) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        if (!ignore && data.success && data.users) {
          setUsers(data.users);
        }
      } catch (err) {
        console.error("Failed to load users:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, []);

  const triggerSync = async () => {
    try {
      setSyncing(true);
      setSyncNotice(null);
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSyncNotice(`Synced with frontendnimbuz.vercel.app & Clerk (${data.counts?.users || 0} streamers updated)`);
        await fetchUsers();
      }
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setSyncing(false);
    }
  };

  const handleUpdateTier = async (userId: string, newTier: UserRecord["tier"]) => {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_tier", userId, tier: newTier })
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, tier: newTier } : u));
        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser({ ...selectedUser, tier: newTier });
        }
      }
    } catch (err) {
      console.error("Failed to update tier:", err);
    }
  };

  const handleCancelSubscription = async (userId: string, userName: string) => {
    try {
      setIsProcessing(true);
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel_subscription", userId })
      });
      const data = await res.json();
      if (data.success) {
        setSyncNotice(`Subscription for streamer ${userName} has been CANCELLED.`);
        setUsers(prev => prev.map(u => (u.id === userId || u.clerkId === userId) ? { ...u, subscriptionStatus: "Cancelled" } : u));
        if (selectedUser && (selectedUser.id === userId || selectedUser.clerkId === userId)) {
          setSelectedUser({ ...selectedUser, subscriptionStatus: "Cancelled" });
        }
      }
    } catch (err) {
      console.error("Failed to cancel subscription:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleActivateSubscription = async (userId: string, userName: string) => {
    try {
      setIsProcessing(true);
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "activate_subscription", userId })
      });
      const data = await res.json();
      if (data.success) {
        setSyncNotice(`Subscription for streamer ${userName} has been ACTIVATED.`);
        setUsers(prev => prev.map(u => (u.id === userId || u.clerkId === userId) ? { ...u, subscriptionStatus: "Active" } : u));
        if (selectedUser && (selectedUser.id === userId || selectedUser.clerkId === userId)) {
          setSelectedUser({ ...selectedUser, subscriptionStatus: "Active" });
        }
      }
    } catch (err) {
      console.error("Failed to activate subscription:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const q = search.toLowerCase();
    const matchesSearch = 
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q) ||
      u.clerkId.toLowerCase().includes(q) ||
      u.tier.toLowerCase().includes(q) ||
      (u.currentGame && u.currentGame.toLowerCase().includes(q)) ||
      (u.subscriptionStatus && u.subscriptionStatus.toLowerCase().includes(q));
    
    const subStatus = u.subscriptionStatus || "Active";
    if (subFilter === "Active") return matchesSearch && subStatus === "Active";
    if (subFilter === "Cancelled") return matchesSearch && subStatus === "Cancelled";
    return matchesSearch;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Executive Clean Header */}
      <div className="bg-white rounded-2xl p-6 border border-zinc-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-zinc-900 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Users className="w-5.5 h-5.5 text-zinc-100" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-semibold text-xl text-zinc-900 tracking-tight">Active Streamers & Accounts</h1>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Synced with Clerk Auth
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1 font-normal">
              Centralized admin management for streamer tier access, direct subscription cancellations, activations, and storefront licenses.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <button
            onClick={triggerSync}
            disabled={syncing}
            className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition-all cursor-pointer flex items-center gap-2 shrink-0 shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync Frontend Data"}
          </button>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search ID, name, email, Clerk ID, tier..."
              className="w-full bg-zinc-50/80 border border-zinc-200/80 focus:border-zinc-400 focus:bg-white focus:outline-none rounded-xl pl-9 pr-8 py-2 text-xs text-zinc-900 placeholder-zinc-400 font-normal transition-all"
            />
            {search && (
              <button 
                onClick={() => setUserSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {syncNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncNotice}</span>
          </div>
          <button onClick={() => setSyncNotice(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-2xl p-6 border border-zinc-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-semibold text-zinc-900 text-base">Registered Streamers</h2>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                {filteredUsers.length} Streamers Listed
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1 font-normal">
              Manage streamer tier access and perform instant subscription cancellations or activations.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-zinc-100/80 border border-zinc-200/70 p-1 rounded-xl text-xs">
            {(["All", "Active", "Cancelled"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setSubFilter(status)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
                  subFilter === status
                    ? "bg-white text-zinc-900 shadow-xs border border-zinc-200/60 font-semibold"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                {status === "All" ? "All Streamers" : status === "Active" ? "Active Subscriptions" : "Cancelled Subscriptions"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-zinc-800" /> Fetching streamer accounts...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500 font-semibold text-[11px] uppercase tracking-wider bg-zinc-50/50">
                  <th className="py-3 px-4">User Details & IDs</th>
                  <th className="py-3 px-4">Subscription Status</th>
                  <th className="py-3 px-4">Plan Tier</th>
                  <th className="py-3 px-4">Currently Playing</th>
                  <th className="py-3 px-4">Games Unlocked</th>
                  <th className="py-3 px-4 text-right">Subscription Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-500 text-xs font-normal">
                      No streamer accounts match &ldquo;{search}&rdquo;.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isSubActive = (u.subscriptionStatus || "Active") === "Active";

                    return (
                      <tr key={u.id} className="hover:bg-zinc-50/60 transition-colors">
                        <td className="py-3.5 px-4 cursor-pointer" onClick={() => setSelectedUser(u)}>
                          <div className="font-semibold text-zinc-900 flex items-center gap-2">
                            {u.name}
                            {u.imageUrl && (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img src={u.imageUrl} alt="" className="w-4 h-4 rounded-full border border-zinc-200" />
                            )}
                          </div>
                          <div className="text-[11px] text-zinc-400 font-normal">{u.email}</div>
                          <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                            ID: <strong className="text-zinc-700">{u.id}</strong> • Clerk: {u.clerkId}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {isSubActive ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Active Subscription
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                              Subscription Cancelled
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <select
                            value={u.tier}
                            onChange={(e) => handleUpdateTier(u.id, e.target.value as UserRecord["tier"])}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-zinc-50 border border-zinc-200/80 text-zinc-900 cursor-pointer focus:outline-none focus:border-zinc-400"
                          >
                            <option value="Basic">BASIC (₹799)</option>
                            <option value="Priority">PRIORITY (₹1,499)</option>
                            <option value="Ultra">ULTRA (₹2,499)</option>
                            <option value="Ultimate">ULTIMATE (₹2,999)</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-zinc-900">
                          {u.currentGame || "—"}
                        </td>
                        <td className="py-3.5 px-4 text-zinc-800">
                          <span className="px-2.5 py-1 rounded-full bg-zinc-100/80 border border-zinc-200 text-[11px] text-zinc-700 font-medium">
                            {u.gamesPurchased?.length || 0} Titles Owned
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isSubActive ? (
                              <button
                                onClick={() => handleCancelSubscription(u.id, u.name)}
                                disabled={isProcessing}
                                className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-medium transition-all cursor-pointer shadow-xs disabled:opacity-50"
                                title="Cancel subscription for this streamer"
                              >
                                Cancel Sub
                              </button>
                            ) : (
                              <button
                                onClick={() => handleActivateSubscription(u.id, u.name)}
                                disabled={isProcessing}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-medium transition-all cursor-pointer shadow-xs disabled:opacity-50"
                                title="Reactivate subscription for this streamer"
                              >
                                Activate Sub
                              </button>
                            )}

                            <button
                              onClick={() => setSelectedUser(u)}
                              className="px-3 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-medium transition-all cursor-pointer inline-flex items-center gap-1 shadow-xs"
                            >
                              Inspect <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-5 border border-zinc-200/90 shadow-xl relative text-zinc-900 animate-in fade-in zoom-in duration-150">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-800 cursor-pointer p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold text-lg shadow-xs">
                {selectedUser.name[0]}
              </div>
              <div>
                <h3 className="font-semibold text-lg text-zinc-900">{selectedUser.name}</h3>
                <p className="text-xs text-zinc-400 font-normal">{selectedUser.email}</p>
                <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                  User ID: <strong className="text-zinc-800">{selectedUser.id}</strong> • Clerk ID: {selectedUser.clerkId}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/70 space-y-1">
                <div className="text-zinc-500 font-normal">Active Plan Tier</div>
                <div className="font-semibold text-zinc-900">{selectedUser.tier} Tier</div>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/70 space-y-1">
                <div className="text-zinc-500 font-normal">Subscription State</div>
                <div className="font-semibold text-zinc-900">
                  {(selectedUser.subscriptionStatus || "Active") === "Active" ? "Active Subscription" : "Cancelled Subscription"}
                </div>
              </div>
            </div>

            {/* Modal Subscription Control Box */}
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-zinc-900">Subscription Status Control</div>
                <p className="text-[11px] text-zinc-500 font-normal mt-0.5">Instant state toggle for cloud streamer access</p>
              </div>

              {(selectedUser.subscriptionStatus || "Active") === "Active" ? (
                <button
                  onClick={() => handleCancelSubscription(selectedUser.id, selectedUser.name)}
                  disabled={isProcessing}
                  className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-medium transition-all cursor-pointer shrink-0 disabled:opacity-50"
                >
                  Cancel Subscription
                </button>
              ) : (
                <button
                  onClick={() => handleActivateSubscription(selectedUser.id, selectedUser.name)}
                  disabled={isProcessing}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-medium transition-all cursor-pointer shrink-0 disabled:opacity-50"
                >
                  Reactivate Subscription
                </button>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-xs text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <Gamepad2 className="w-4 h-4 text-zinc-700" /> Games Purchased / Storefront Licenses
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedUser.gamesPurchased && selectedUser.gamesPurchased.length > 0 ? (
                  selectedUser.gamesPurchased.map((game, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-zinc-100 border border-zinc-200 text-xs text-zinc-800 font-medium">
                      🎮 {game}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-zinc-400 font-normal">No paid titles bound yet</span>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
              <span className="text-zinc-500 font-normal">Member Since: {selectedUser.joined}</span>
              <span className="text-zinc-900 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> {selectedUser.status}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UsersPage() {
  return (
    <Suspense fallback={
      <div className="py-12 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-zinc-800" /> Loading Users...
      </div>
    }>
      <UsersPageContent />
    </Suspense>
  );
}
